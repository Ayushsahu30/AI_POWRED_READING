import { useState } from "react";
import { toast } from "react-toastify";
import ReadScreenNew from "./ReadScreenNew";

function GuidedReadingNew({ document, setDocument }) {
  const { paragraphs, readingProgress } = document;
  const { paragraphIndex } = readingProgress;

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const currentParagraph = paragraphs[paragraphIndex];

  const handleNextParagraph = () => {
    if (paragraphIndex < paragraphs.length - 1) {
      const updated = {
        ...document,
        readingProgress: {
          ...readingProgress,
          paragraphIndex: paragraphIndex + 1,
          highestClarificationLevel: 0
        }
      };
      localStorage.setItem("document", JSON.stringify(updated));
      setDocument(updated);
      setShowExplanation(false);
      setExplanation("");
      toast.info("Moving to next paragraph...");
    } else {
      toast.success("🎉 Congratulations! You've finished reading all paragraphs!");
    }
  };

  const handlePreviousParagraph = () => {
    if (paragraphIndex > 0) {
      const updated = {
        ...document,
        readingProgress: {
          ...readingProgress,
          paragraphIndex: paragraphIndex - 1
        }
      };
      localStorage.setItem("document", JSON.stringify(updated));
      setDocument(updated);
      setShowExplanation(false);
      setExplanation("");
    }
  };

  const handleIUnderstand = () => {
    toast.success("Great! Moving to next paragraph...");
    setTimeout(() => handleNextParagraph(), 800);
  };

  const handleIDontUnderstand = async () => {
    setIsLoadingExplanation(true);
    try {
      const response = await fetch("http://localhost:4000/api/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraph: currentParagraph,
          level: 1
        })
      });

      const data = await response.json();
      setExplanation(data.clarification);
      setShowExplanation(true);
      toast.info("Here's an explanation to help you understand better");
    } catch (err) {
      toast.error("Error getting explanation. Please try again.");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <div className="reading-container">
      <div className="reading-main">
        {/* Toolbar */}
        <div className="reading-toolbar">
          <div className="progress-info">
            <span>
              Paragraph <strong>{paragraphIndex + 1}</strong> of <strong>{paragraphs.length}</strong>
            </span>
            <div style={{ width: "200px" }}>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((paragraphIndex + 1) / paragraphs.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            {paragraphIndex < paragraphs.length - 1 && (
              <button className="btn-secondary btn-sm" onClick={handleNextParagraph}>
                Skip →
              </button>
            )}
          </div>
        </div>

        {/* Paragraph Display */}
        <ReadScreenNew currentParagraph={currentParagraph} />

        {/* Understanding Options */}
        {!showExplanation && (
          <div className="reading-actions" style={{ marginTop: "32px" }}>
            <button
              className="btn-secondary"
              onClick={handlePreviousParagraph}
              disabled={paragraphIndex === 0}
            >
              ← Previous
            </button>

            <button
              className="btn-primary"
              onClick={handleIUnderstand}
            >
              I Understand
            </button>

            <button
              className="btn-secondary"
              onClick={handleIDontUnderstand}
              disabled={isLoadingExplanation}
            >
              {isLoadingExplanation ? "Loading..." : "I Don't Understand"}
            </button>
          </div>
        )}

        {/* Explanation Section */}
        {showExplanation && (
          <div style={{
            marginTop: "32px",
            padding: "24px",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: "12px"
          }}>
            <h3 style={{
              marginBottom: "16px",
              color: "var(--text-primary)",
              fontSize: "1.1rem"
            }}>
              💡 Explanation
            </h3>
            <p style={{
              color: "var(--text-primary)",
              lineHeight: "1.8",
              marginBottom: "24px",
              fontSize: "0.95rem"
            }}>
              {explanation}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                onClick={handleIUnderstand}
              >
                Now I Understand
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowExplanation(false)}
              >
                Show Paragraph Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="reading-sidebar">
        <div className="sidebar-card">
          <div className="sidebar-title">Reading Stats</div>
          <div className="progress-stats">
            <div className="stat-row">
              <span>Total Paragraphs</span>
              <span className="stat-value">{paragraphs.length}</span>
            </div>
            <div className="stat-row">
              <span>Current Progress</span>
              <span className="stat-value">
                {Math.round(((paragraphIndex + 1) / paragraphs.length) * 100)}%
              </span>
            </div>
            <div className="stat-row">
              <span>Remaining</span>
              <span className="stat-value">{paragraphs.length - paragraphIndex - 1}</span>
            </div>
          </div>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-title">Tips</div>
          <ul style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, listStyle: "none" }}>
            <li style={{ marginBottom: "8px" }}>✓ Read carefully</li>
            <li style={{ marginBottom: "8px" }}>✓ Think critically</li>
            <li style={{ marginBottom: "8px" }}>✓ Ask for help when needed</li>
            <li>✓ Keep learning</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default GuidedReadingNew;
