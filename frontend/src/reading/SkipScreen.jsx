function SkipScreen({ onSkip }) {
  return (
    <div className="reading-card">
      <h2>This section hasn’t been understood yet.</h2>

      <button
        type="button"
        className="primary-btn"
        onClick={onSkip}
      >
        Skip
      </button>
    </div>
  );
}

export default SkipScreen;
