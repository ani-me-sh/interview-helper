import { useState } from 'react'
import Modal from './Modal.jsx'

const SUGGESTIONS = [
    'Make it fit on one page',
    'Use a serif font',
    'Move Skills to the top',
    'Use a dark blue accent colour',
    'Emphasize leadership and teamwork',
]

const ResumeCustomizeModal = ({ open, busy, error, onSubmit, onClose }) => {
    const [ text, setText ] = useState('')

    const addSuggestion = (suggestion) => {
        setText((current) => (current.trim() ? `${current.trim()}. ${suggestion}` : suggestion).slice(0, 500))
    }

    return (
        <Modal open={open} onClose={onClose} busy={busy} labelledBy='resume-modal-title'>
            <h2 id='resume-modal-title' className='modal__title'>Customize &amp; Regenerate Resume</h2>
            <p className='modal__text'>
                Tell us what to change in the structure, content or design. Everything else stays the same.
            </p>
            <textarea
                className='modal__textarea'
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                disabled={busy}
                autoFocus
                placeholder='e.g. Put Projects before Work Experience, shorten the summary, use a serif font...'
            />
            <div className='modal__chips'>
                {SUGGESTIONS.map((suggestion) => (
                    <button key={suggestion} type='button' className='modal__chip' disabled={busy} onClick={() => addSuggestion(suggestion)}>
                        + {suggestion}
                    </button>
                ))}
            </div>
            {busy && <p className='modal__hint'>Regenerating your resume, this usually takes 10-20 seconds...</p>}
            {error && <p className='modal__error' role='alert'>{error}</p>}
            <div className='modal__actions'>
                <button type='button' className='button secondary-button' onClick={onClose} disabled={busy}>
                    Cancel
                </button>
                <button
                    type='button'
                    className='button primary-button'
                    disabled={busy || !text.trim()}
                    onClick={() => onSubmit(text.trim())}
                >
                    {busy ? <><span className='spinner spinner--sm' />Generating...</> : 'Generate'}
                </button>
            </div>
        </Modal>
    )
}

export default ResumeCustomizeModal
