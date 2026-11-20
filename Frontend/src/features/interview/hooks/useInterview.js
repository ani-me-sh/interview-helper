import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () =>{

    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if (!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading,setLoading,report,setReport,reports,setReports} = context

    const generateReport = async ({jobDescription,selfDescription,resumeFile})=>{
        setLoading(true)
        let response
        try{
            response = await generateInterviewReport({jobDescription,selfDescription,resumeFile})
            setReport(response.interviewReport)
        }catch(err){
            console.log(err)
            throw err // let the page show an error message
        }finally{
            setLoading(false);
        }
        return response.interviewReport
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null;
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReports
    }

    // Generates (or re-downloads) the resume PDF. Doesn't touch the global `loading` flag,
    // so the interview page stays visible while the resume is being prepared.
    // Throws on failure so the caller can show a message.
    const getResumePdf = async (interviewReportId, customization = "") => {
        const response = await generateResumePdf({ interviewReportId, customization })
        const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `resume_${interviewReportId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    // Deletes a saved report and removes it from the in-memory list. Throws on failure.
    const deleteReport = async (reportId) => {
        await deleteInterviewReport(reportId)
        setReports((current) => current.filter((r) => r._id !== reportId))
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {}) // errors are already logged and handled by the page
        } else {
            getReports().catch(() => {})
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }

}