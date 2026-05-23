import { useState, useEffect } from "react";
import { evaluateTeachback } from "../api";

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function TeachBack({ paragraph, onAccepted, onNotAccepted }) {

  const [text, setText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  // Reset state when paragraph changes (VERY IMPORTANT)
  useEffect(() => {
    setText("");
    setStatusMessage("");
    setStatusType("");
  }, [paragraph]);

  const handleSubmit = async () => {

    setStatusMessage("");
    setStatusType("");

    const trimmed = text.trim();
    const words = countWords(trimmed);

    // Local validation
    if (!trimmed) {
      setStatusMessage("Teach-back cannot be empty.");
      setStatusType("error");
      return;
    }

    if (words < 20) {
      setStatusMessage("Teach-back must be at least 20 words.");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);

      const result = await evaluateTeachback(
        paragraph,
        trimmed,
        20
      );

      const isAccepted = result.status === "ACCEPTED";

      if (isAccepted) {
        setStatusMessage(`${result.status}: ${result.reason}`);
        setStatusType("success");
        onAccepted();
      } else {
        onNotAccepted();
      }

    } catch (error) {

      setStatusMessage(
        error.message || "Something went wrong while evaluating your answer."
      );
      setStatusType("error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reading-card">

      <h2>Explain this in your own words</h2>

      {/* 🚫 Trace is NOT available here by design */}

      <textarea
        placeholder="Type your explanation..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {statusMessage && (
        <p
          className={
            statusType === "success"
              ? "success-text"
              : "error-text"
          }
        >
          {statusMessage}
        </p>
      )}

      <button
        type="button"
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Checking..." : "Submit teach-back"}
      </button>

    </div>
  );
}

export default TeachBack;
