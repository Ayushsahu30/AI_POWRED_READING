import { useEffect, useState, useRef } from "react";
import { fetchClarification } from "../api";
import TracePopup from "./TracePopup";

function ClarifyLevel1({ paragraph, onMore, onContinue }) {

  const [clarification, setClarification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedText, setSelectedText] = useState("");
  const [showTrace, setShowTrace] = useState(false);

  const textRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadClarification = async () => {
      try {
        setLoading(true);
        const { clarification: text } =
          await fetchClarification(paragraph, 1);

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

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      const anchorNode = selection.anchorNode;

      if (!text || text.length < 5) {
        setSelectedText("");
        return;
      }

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

  return (
    <div className="reading-card">
      <h2>Clarification Level 1</h2>

      <div
        ref={textRef}
        className="paragraph"
      >
        {loading && "Loading clarification..."}
        {error && <span className="error-text">{error}</span>}
        {!loading && !error && clarification}
      </div>

      {selectedText && (
        <button
          className="secondary-btn"
          onClick={() => setShowTrace(true)}
        >
          Trace
        </button>
      )}

      <div className="btn-row">
        <button onClick={onMore} disabled={loading}>
          Make even clearer
        </button>

        <button
          className="primary-btn"
          onClick={onContinue}
          disabled={loading}
        >
          Continue
        </button>
      </div>

      {showTrace && (
        <TracePopup
          paragraph={paragraph}
          selectedText={selectedText}
          onClose={() => {
            setShowTrace(false);
            setSelectedText("");
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </div>
  );
}

export default ClarifyLevel1;
