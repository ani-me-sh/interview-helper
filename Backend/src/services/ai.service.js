const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer")
const { buildResumeHtml } = require("./resumeTemplate")


const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const questionSchema = {
    type: "object",
    properties: {
        question: { type: "string", description: "The question that can be asked in the interview" },
        intention: { type: "string", description: "The intention of interviewer behind asking this question" },
        answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." }
    },
    required: ["question", "intention", "answer"]
};

const interviewReportSchema = {
    type: "object",
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: questionSchema
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: questionSchema
        },
        skillGaps: {
            type: "array",
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "array",
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: "object",
                properties: {
                    day: { type: "number", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "string", description: "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc." },
                    tasks: {
                        type: "array",
                        description: "List of tasks to be done on this day to follow the preparation plan",
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"]
};


async function generateInterviewReport({resume,selfDescription,jobDescription}){
    
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
                    Follow the specified output schema strictly with no extra texts at all.
                    `

    
    const response = await ai.models.generateContent({
        model:'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        }
    })

    result = JSON.parse(response.text)
    return result
    
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "load" })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "14mm",
                bottom: "14mm",
                left: "16mm",
                right: "16mm"
            }
        })
        return Buffer.from(pdfBuffer)
    } finally {
        await browser.close()
    }
}

const resumeSchema = {
    type: "object",
    properties: {
        name: { type: "string", description: "Candidate's full name" },
        headline: { type: "string", description: "Short professional title tailored to the target job, e.g. 'Full Stack Developer'" },
        contact: {
            type: "array",
            maxItems: 5,
            description: "Contact details found in the candidate's resume (phone, email, location, links such as LinkedIn/GitHub)",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["phone", "email", "location", "link"] },
                    value: { type: "string" }
                },
                required: ["type", "value"]
            }
        },
        sections: {
            type: "array",
            maxItems: 8,
            description: "Resume sections in display order",
            items: {
                type: "object",
                properties: {
                    heading: { type: "string", description: "Section heading, e.g. 'About Me', 'Work Experience', 'Education', 'Projects', 'Skills'" },
                    kind: { type: "string", enum: ["text", "entries", "skills"], description: "text = a paragraph, entries = list of roles/degrees/projects, skills = list of short skill names" },
                    text: { type: "string", description: "Paragraph content (kind = text)" },
                    entries: {
                        type: "array",
                        description: "Items (kind = entries)",
                        items: {
                            type: "object",
                            properties: {
                                meta: { type: "string", description: "Organisation and dates on one line, e.g. 'Borcelle University | 2023 - 2026'" },
                                title: { type: "string", description: "Role, degree or project name" },
                                bullets: { type: "array", items: { type: "string" }, description: "1-4 concise, impact-focused points" }
                            },
                            required: ["title"]
                        }
                    },
                    skills: { type: "array", items: { type: "string" }, description: "Short skill names (kind = skills)" }
                },
                required: ["heading", "kind"]
            }
        },
        design: {
            type: "object",
            description: "Visual options. Keep the defaults (sans, #222222, normal, 3) unless the user asks for a change.",
            properties: {
                fontStyle: { type: "string", enum: ["sans", "serif"] },
                accentColor: { type: "string", description: "Hex colour like #1a3c6e used for the name and headings" },
                density: { type: "string", enum: ["compact", "normal", "relaxed"] },
                skillColumns: { type: "number", description: "1 to 4" }
            }
        }
    },
    required: ["name", "headline", "contact", "sections"]
};

/**
 * Asks Gemini for a structured resume (not HTML). The fixed template in resumeTemplate.js
 * handles the layout, so the look stays consistent and the model can't break the formatting.
 * If previousResume + customization are given, the existing resume is modified instead of rewritten.
 */
async function generateResumeData({ resume, selfDescription, jobDescription, customization, previousResume }) {

    const customizing = Boolean(previousResume && customization)

    const prompt = customizing
        ? `You are editing an existing resume (JSON below) for a candidate applying to the job described below.
Apply the user's requested changes and keep everything else as it is. Never invent employers, degrees, dates or achievements that are not in the original details.

Current resume JSON:
${JSON.stringify(previousResume)}

User's requested changes:
${customization}

Original resume text: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return the complete updated resume following the output schema.`
        : `Create a plain, professional, ATS-friendly resume for the candidate below, tailored to the job description.

Rules:
- Use only facts from the candidate's resume and self description. Never invent employers, degrees, dates, numbers or contact details; omit anything that is missing.
- Choose section headings and their order to suit this candidate (for example: About Me, Education, Work Experience, Projects, Certifications, Achievements, Skills). Put the most relevant sections for the job first and skip sections with no content.
- Include at most 4 contact items (phone, email, location and one link).
- Start with a short 2-3 sentence summary section tailored to the job.
- Write naturally and concisely, as a human would. Use 1-4 impact-focused bullet points per role or project. The resume should fit on 1-2 pages.
- Keep every text field short (a summary is at most 400 characters; a bullet at most 200).
- List each role, degree or project exactly once. Never repeat an entry.
- Order entries from most recent to oldest. Put dates in the "meta" line together with the organisation.
- Use a single "skills" section with short skill names, prioritising skills relevant to the job.
${customization ? `- The candidate also asked: ${customization}` : ""}

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`

    // Gemini's free tier is sometimes overloaded (503) and the lite model occasionally returns
    // malformed/runaway JSON, so retry a couple of times (last attempt on the regular flash model).
    const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash-lite", "gemini-2.5-flash"]
    let lastError
    for (let attempt = 0; attempt < models.length; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: models[attempt],
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: resumeSchema,
                    maxOutputTokens: 4096,
                    temperature: 0.4,
                }
            })
            return JSON.parse(response.text)
        } catch (err) {
            lastError = err
            await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
        }
    }
    throw lastError
}

async function renderResumePdf(resumeData) {
    return generatePdfFromHtml(buildResumeHtml(resumeData))
}

module.exports = {generateInterviewReport,generateResumeData,renderResumePdf}
