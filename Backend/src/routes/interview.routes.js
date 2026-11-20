const express = require('express')
const {generateInterviewReportController,getInterviewReportByIdController,getAllInterviewReportsController,generateResumePdfController,deleteInterviewReportController} = require('../controllers/interview.controller')
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require('../middlewares/file.middleware')

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report based on user self description, resume pdf and job description
 * @access private
 */
interviewRouter.post("/",authMiddleware.authUser,upload.single('resume'),generateInterviewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by id
 * @access private
 */
interviewRouter.get('/report/:interviewId',authMiddleware.authUser,getInterviewReportByIdController)

/**
 * @route DELETE /api/interview/report/:interviewId
 * @description delete an interview report of the logged in user
 * @access private
 */
interviewRouter.delete('/report/:interviewId',authMiddleware.authUser,deleteInterviewReportController)

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user
 * @access private
 */
interviewRouter.get('/',authMiddleware.authUser,getAllInterviewReportsController)

/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, generateResumePdfController)

module.exports = interviewRouter