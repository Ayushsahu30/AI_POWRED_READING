import { useEffect, useState } from "react";
import { generateTrace } from "../api";

function TracePopup({ paragraph, selectedText, onClose }) {

  const [variants, setVariants] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrace() {
      try {
        setLoading(true);
        setError("");

        const result = await generateTrace(paragraph, selectedText);

        if (!result.variants || result.variants.length !== 3) {
          throw new Error("Invalid trace result");
        }

        setVariants(result.variants);
      } catch (err) {
        setError("Failed to generate trace explanation.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrace();

    // prevent body scroll while modal open
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };

  }, [paragraph, selectedText]);

  return (
    <div className="trace-overlay" onClick={onClose}>
      <div
        className="trace-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Trace Explanation</h3>

        {loading && <p>Generating explanation...</p>}

        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            <div className="trace-content">
              {variants[activeIndex]}
            </div>

            <div className="trace-tabs">
              {variants.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={
                    i === activeIndex
                      ? "trace-tab active"
                      : "trace-tab"
                  }
                  onClick={() => setActiveIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          className="primary-btn"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default TracePopup;
