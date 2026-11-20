import { useState, useEffect } from 'react'

/**
 * Full page loading screen with a spinner. If `steps` are given, they are ticked off one by one
 * (purely visual progress, advancing every few seconds).
 */
const LoadingScreen = ({ title, subtitle, steps = [] }) => {
    const [ step, setStep ] = useState(0)

    useEffect(() => {
        if (steps.length < 2) return
        const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 4500)
        return () => clearInterval(id)
    }, [ steps.length ])

    return (
        <main className='loading-screen'>
            <span className='spinner spinner--lg' role='status' aria-label='Loading' />
            <h1>{title}</h1>
            {subtitle && <p className='loading-screen__subtitle'>{subtitle}</p>}
            {steps.length > 0 && (
                <ul className='loading-screen__steps'>
                    {steps.map((label, i) => (
                        <li key={label} className={i < step ? 'is-done' : i === step ? 'is-active' : ''}>{label}</li>
                    ))}
                </ul>
            )}
        </main>
    )
}

export default LoadingScreen
