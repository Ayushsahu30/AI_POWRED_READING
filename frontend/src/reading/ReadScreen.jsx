import { useState, useEffect, useRef } from "react";
import TracePopup from "./TracePopup";

function ReadScreen({ paragraph, index, onContinue }) {

  const [selectedText, setSelectedText] = useState("");
  const [showTrace, setShowTrace] = useState(false);

  const paragraphRef = useRef(null);

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

      // 🔥 Check if selection is inside paragraph div
      if (
        paragraphRef.current &&
        anchorNode &&
        paragraphRef.current.contains(anchorNode)
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
      <h2>Paragraph {index + 1}</h2>

      <div
        ref={paragraphRef}
        className="paragraph"
      >
        {paragraph}
      </div>

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

export default ReadScreen;
