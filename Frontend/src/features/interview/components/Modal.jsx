import { useEffect } from 'react'

/**
 * Small accessible modal shell. Closes on Escape or overlay click unless `busy`.
 */
const Modal = ({ open, onClose, busy = false, labelledBy, children }) => {

    useEffect(() => {
        if (!open) return
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !busy) onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [ open, busy, onClose ])

    if (!open) return null

    return (
        <div className='modal-overlay' onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose() }}>
            <div className='modal' role='dialog' aria-modal='true' aria-labelledby={labelledBy}>
                {children}
            </div>
        </div>
    )
}

export default Modal
