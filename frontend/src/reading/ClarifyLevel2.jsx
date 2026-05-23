import { useEffect, useState, useRef } from "react";
import { fetchClarification } from "../api";
import TracePopup from "./TracePopup";

function ClarifyLevel2({ paragraph, onContinue }) {

  const [clarification, setClarification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedText, setSelectedText] = useState("");
  const [showTrace, setShowTrace] = useState(false);

  const textRef = useRef(null);

  // Load Level 2 clarification
  useEffect(() => {
    let isMounted = true;

    const loadClarification = async () => {
      try {
        setLoading(true);
        setError("");

        const { clarification: text } =
          await fetchClarification(paragraph, 2);

        if (isMounted) {
          setClarification(text);
        }

      } catch (err) {
        if (isMounted) {
          setError("Failed to load clarification.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClarification();

    return () => {
      isMounted = false;
    };

  }, [paragraph]);

  // Handle text selection for Trace (only inside clarification block)
  useEffect(() => {

    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      const anchorNode = selection.anchorNode;

      // Ignore empty or too small selection
      if (!text || text.length < 5) {
        setSelectedText("");
        return;
      }

      // Ensure selection is inside clarification block
      if (
        textRef.current &&
        anchorNode &&
        textRef.current.contains(anchorNode)
      ) {
        setSelectedText(text);
      } else {
        setSelectedText("");
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };

  }, []);

  const handleCloseTrace = () => {
    setShowTrace(false);
    setSelectedText("");
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="reading-card">
      <h2>Clarification Level 2</h2>

      <div
        ref={textRef}
        className="paragraph"
      >
        {loading && "Loading clarification..."}
        {error && <span className="error-text">{error}</span>}
        {!loading && !error && clarification}
      </div>

      {/* Trace button appears only for valid selection */}
      {selectedText && (
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setShowTrace(true)}
        >
          Trace
        </button>
      )}

      <button
        type="button"
        className="primary-btn"
        onClick={onContinue}
        disabled={loading}
      >
        Continue
      </button>

      {showTrace && (
        <TracePopup
          paragraph={paragraph}
          selectedText={selectedText}
          onClose={handleCloseTrace}
        />
      )}
    </div>
  );
}

export default ClarifyLevel2;
