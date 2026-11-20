import { useState } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import SignOutButton from '../../auth/components/SignOutButton.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'

const GENERATING_STEPS = [
    'Reading your resume',
    'Analyzing the job description',
    'Crafting interview questions',
    'Building your preparation plan',
]

const MAX_RESUME_SIZE = 3 * 1024 * 1024 // matches the 3MB limit on the backend

const formatFileSize = (bytes) =>
    bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

const Home = () => {

    const { generateReport, reports, deleteReport } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ uploadError, setUploadError ] = useState("")
    const [ dragging, setDragging ] = useState(false)
    const [ isGenerating, setIsGenerating ] = useState(false)
    const [ generateError, setGenerateError ] = useState("")
    const [ pendingDelete, setPendingDelete ] = useState(null)
    const [ deleting, setDeleting ] = useState(false)
    const [ deleteError, setDeleteError ] = useState("")

    const navigate = useNavigate()

    const handleFileSelected = (file) => {
        if (!file) return
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        if (!isPdf) {
            setUploadError('Only PDF files are supported.')
            return
        }
        if (file.size > MAX_RESUME_SIZE) {
            setUploadError('File is too large. Maximum size is 3MB.')
            return
        }
        setUploadError("")
        setResumeFile(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        handleFileSelected(e.dataTransfer.files[0])
    }

    const handleGenerateReport = async () => {
        setGenerateError("")
        if (!resumeFile) {
            setUploadError('Please upload your resume (PDF) to continue.')
            return
        }
        setIsGenerating(true)
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            navigate(`/interview/${data._id}`)
        } catch {
            setGenerateError('Could not generate your interview plan. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleConfirmDelete = async () => {
        setDeleting(true)
        setDeleteError("")
        try {
            await deleteReport(pendingDelete._id)
            setPendingDelete(null)
        } catch {
            setDeleteError('Could not delete this plan. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    const closeDeleteModal = () => {
        setPendingDelete(null)
        setDeleteError("")
    }

    if (isGenerating) {
        return (
            <LoadingScreen
                title='Building your interview strategy'
                subtitle='This can take up to a minute. Please keep this tab open.'
                steps={GENERATING_STEPS}
            />
        )
    }

    return (
        <div className='home-page'>

            {/* Top Bar */}
            <div className='page-topbar'>
                <SignOutButton />
            </div>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Custom <span className='highlight'>Interview Plan</span> Creator</h1>
                <p>Analyze the job requirements and your profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Enter the full job description here...`}
                            maxLength={5000}
                        />
    
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>For Best Results</span>
                            </label>
                            <label
                                className={`dropzone ${resumeFile ? 'dropzone--has-file' : ''} ${dragging ? 'dropzone--dragging' : ''}`}
                                htmlFor='resume'
                                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                            >
                                <span className='dropzone__icon'>
                                    {resumeFile ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                {resumeFile ? (
                                    <>
                                        <p className='dropzone__title dropzone__title--file'>{resumeFile.name}</p>
                                        <p className='dropzone__subtitle'>{formatFileSize(resumeFile.size)} &middot; Click or drop to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF File (Max 3MB)</p>
                                    </>
                                )}
                                <input
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,application/pdf'
                                    onChange={(e) => {
                                        handleFileSelected(e.target.files[0])
                                        e.target.value = '' // allow re-selecting the same file
                                    }}
                                />
                            </label>
                            {resumeFile && (
                                <button type='button' className='dropzone__remove' onClick={() => setResumeFile(null)}>
                                    Remove file
                                </button>
                            )}
                            {uploadError && <p className='dropzone__error' role='alert'>{uploadError}</p>}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your interests, experience, key skills, and years of experience ....."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Both a <strong>Resume</strong> and a <strong>Self Description</strong> is recommended for the most optimal personalized plan</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    {generateError
                        ? <span className='footer-info footer-info--error' role='alert'>{generateError}</span>
                        : <span className='footer-info'>AI-Powered Strategy Generation</span>}
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>Generated Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <button
                                    type='button'
                                    className='report-item__delete'
                                    aria-label={`Delete ${report.title || 'interview plan'}`}
                                    title='Delete this plan'
                                    onClick={(e) => { e.stopPropagation(); setPendingDelete(report) }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                </button>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <ConfirmDeleteModal
                report={pendingDelete}
                busy={deleting}
                error={deleteError}
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
            />

            {/* Page Footer */}
            <footer className='page-footer'>
                {/* <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a> */}
            </footer>
        </div>
    )
}

export default Home