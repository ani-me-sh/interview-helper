import Modal from './Modal.jsx'

const ConfirmDeleteModal = ({ report, busy, error, onConfirm, onCancel }) => (
    <Modal open={Boolean(report)} onClose={onCancel} busy={busy} labelledBy='delete-modal-title'>
        <h2 id='delete-modal-title' className='modal__title'>Delete this interview plan?</h2>
        <p className='modal__text'>
            <strong>{report?.title || 'Untitled Position'}</strong> and everything generated for it
            (questions, skill gaps, road map and resume) will be permanently removed. This can&apos;t be undone.
        </p>
        {error && <p className='modal__error' role='alert'>{error}</p>}
        <div className='modal__actions'>
            <button type='button' className='button secondary-button' onClick={onCancel} disabled={busy} autoFocus>
                Cancel
            </button>
            <button type='button' className='button danger-button' onClick={onConfirm} disabled={busy}>
                {busy ? <><span className='spinner spinner--sm' />Deleting...</> : 'Delete'}
            </button>
        </div>
    </Modal>
)

export default ConfirmDeleteModal
