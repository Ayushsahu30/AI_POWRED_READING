import { useState, useEffect, useRef } from "react";

function WordDefinitionPopup({ word, sentence, position, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchDefinition = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:4000/api/define-word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word, sentence }),
        });

        if (!response.ok) throw new Error("Failed to fetch definition");

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("Could not load definition");
      } finally {
        setLoading(false);
      }
    };

    if (word) fetchDefinition();
  }, [word, sentence]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position so popup doesn't overflow the viewport
  const getAdjustedStyle = () => {
    const style = {
      position: "fixed",
      zIndex: 1000,
    };

    // Start at cursor position
    let left = position.x;
    let top = position.y + 12; // 12px below the word

    // Check right overflow
    const popupWidth = 340;
    if (left + popupWidth > window.innerWidth - 16) {
      left = window.innerWidth - popupWidth - 16;
    }
    if (left < 16) left = 16;

    // Check bottom overflow
    const popupHeight = 220;
    if (top + popupHeight > window.innerHeight - 16) {
      top = position.y - popupHeight - 12; // Show above instead
    }

    style.left = `${left}px`;
    style.top = `${top}px`;

    return style;
  };

  return (
    <div
      ref={popupRef}
      className="word-definition-popup"
      style={getAdjustedStyle()}
    >
      {/* Close button */}
      <button
        className="word-def-close"
        onClick={onClose}
        aria-label="Close definition"
      >
        ×
      </button>

      {loading && (
        <div className="word-def-loading">
          <div className="word-def-spinner" />
          <span>Looking up "{word}"…</span>
        </div>
      )}

      {error && (
        <div className="word-def-error">
          <span className="word-def-error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && data && (
        <div className="word-def-content">
          <div className="word-def-header">
            <span className="word-def-word">{data.word}</span>
            {data.phonetic && (
              <span className="word-def-phonetic">{data.phonetic}</span>
            )}
          </div>

          {data.partOfSpeech && (
            <span className="word-def-pos">{data.partOfSpeech}</span>
          )}

          <p className="word-def-meaning">{data.definition}</p>

          {data.example && (
            <div className="word-def-example">
              <span className="word-def-example-label">Example</span>
              <p>"{data.example}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WordDefinitionPopup;
