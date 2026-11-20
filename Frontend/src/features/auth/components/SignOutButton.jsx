import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { InterviewContext } from '../../interview/interview.context'

const SignOutButton = () => {
    const { handleLogout } = useAuth()
    const interviewContext = useContext(InterviewContext)
    const navigate = useNavigate()

    const onSignOut = async () => {
        await handleLogout()
        // don't leave the previous user's reports in memory
        interviewContext?.setReport(null)
        interviewContext?.setReports([])
        navigate('/login', { replace: true })
    }

    return (
        <button type='button' className='button secondary-button' onClick={onSignOut}>
            Sign out
        </button>
    )
}

export default SignOutButton
