function ReadingCompleteModal({ message, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-text">{message}</div>
        <button className="primary-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default ReadingCompleteModal;
