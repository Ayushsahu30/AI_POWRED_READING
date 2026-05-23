function SelfAssessment({ onUnderstand, onNeedHelp }) {
  return (
    <div className="reading-card">
      <h2>Do you understand this paragraph?</h2>

      <div className="option-grid">
        <button onClick={onUnderstand}>
          ✅ I understand
        </button>

        <button onClick={onNeedHelp}>
          ⚠️ I partially understand
        </button>

        <button onClick={onNeedHelp}>
          ❓ I do not understand
        </button>
      </div>
    </div>
  );
}

export default SelfAssessment;
