const pdfParse = require('pdf-parse')
const mongoose = require('mongoose')
const {generateInterviewReport, generateResumeData, renderResumePdf} = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model')


/**
 * @description controller to generate interview report based on user self description, resume and job description 
 */
async function generateInterviewReportController(req,res){

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const {selfDescription, jobDescription} = req.body

    const interviewReportByAI = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAI
    })
    res.status(201).json({
        message:"Interview Report generated successfully",
        interviewReport
    })
}

/**
 * @description controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req,res) {
    const {interviewId} = req.params
    const interviewReport = await interviewReportModel.findOne({
        _id:interviewId, user: req.user.id
    })
    if (!interviewReport){
        return res.status(404).json({
            message:'Interview report not found.'
        })
    }
    res.status(200).json({
        message:"Interview report fetched successfully",
        interviewReport
    })
}

/**
 * @description controller to get all interview reports of logged in user
 */
async function getAllInterviewReportsController(req,res) {
    const interviewReports = await interviewReportModel.find({user: req.user.id})
    .sort({createdAt:-1})
    .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -resumeData")
    
    res.status(200).json({
        message:"Interview reports fetched successfully",
        interviewReports
    })
}


/**
 * @description Controller to generate (or re-download) the resume PDF for a report.
 * - no saved resume yet            -> generate one with AI, save it, return the PDF
 * - saved resume + customization   -> modify the saved resume with AI, save it, return the PDF
 * - saved resume, no customization -> just re-render the saved resume (no AI call)
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        if (!mongoose.isValidObjectId(interviewReportId)) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const customization = typeof req.body?.customization === "string"
            ? req.body.customization.trim().slice(0, 500)
            : ""

        let resumeData = interviewReport.resumeData

        if (!resumeData || customization) {
            const { resume, jobDescription, selfDescription } = interviewReport
            resumeData = await generateResumeData({
                resume,
                jobDescription,
                selfDescription,
                customization,
                previousResume: interviewReport.resumeData
            })
            await interviewReportModel.updateOne({ _id: interviewReportId }, { $set: { resumeData } })
        }

        const pdfBuffer = await renderResumePdf(resumeData)

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("Resume generation failed:", err.message)
        res.status(500).json({ message: "Failed to generate the resume. Please try again." })
    }
}

/**
 * @description Controller to delete an interview report of the logged in user
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params

    if (!mongoose.isValidObjectId(interviewId)) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    const deleted = await interviewReportModel.findOneAndDelete({ _id: interviewId, user: req.user.id })

    if (!deleted) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    res.status(200).json({ message: "Interview report deleted successfully" })
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController, deleteInterviewReportController }