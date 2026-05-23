function LastChance({ variants, onRetry }) {

  return (
    <div className="reading-card">
      <h2>Last Chance</h2>

      <div className="last-chance-container">
        {variants.map((v, i) => (
          <div key={i} className="last-chance-item">
            <div className="variant-content">
              {v}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="primary-btn"
        onClick={onRetry}
      >
        Try Teach-Back Again
      </button>
    </div>
  );
}

export default LastChance;
