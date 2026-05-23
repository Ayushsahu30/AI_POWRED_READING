import { useState, useRef, useCallback } from "react";
import WordDefinitionPopup from "./WordDefinitionPopup";

function ReadScreenNew({ currentParagraph }) {
  const [popup, setPopup] = useState(null); // { word, sentence, position }
  const longPressTimer = useRef(null);
  const pressTarget = useRef(null);

  const LONG_PRESS_DURATION = 500; // ms

  // Extract the sentence a word belongs to
  const getSentenceForWord = useCallback(
    (wordIndex) => {
      const text = currentParagraph;
      // Split text into sentences (rough split on . ! ?)
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      let charCount = 0;
      // Find the word's approximate position
      const words = text.split(/\s+/);
      for (let i = 0; i < wordIndex && i < words.length; i++) {
        charCount += words[i].length + 1;
      }

      // Find which sentence contains this character position
      let runningLength = 0;
      for (const sentence of sentences) {
        runningLength += sentence.length;
        if (charCount < runningLength) {
          return sentence.trim();
        }
      }

      return sentences[sentences.length - 1]?.trim() || text;
    },
    [currentParagraph]
  );

  const handlePointerDown = useCallback(
    (e, word, wordIndex) => {
      // Only react to primary button (mouse) or touch
      if (e.button && e.button !== 0) return;

      pressTarget.current = e.target;

      longPressTimer.current = setTimeout(() => {
        // Prevent text selection after long press
        window.getSelection()?.removeAllRanges();

        const rect = e.target.getBoundingClientRect();
        const sentence = getSentenceForWord(wordIndex);

        // Clean the word (remove punctuation at edges)
        const cleanWord = word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, "");

        if (cleanWord.length < 2) return; // Skip very short fragments

        setPopup({
          word: cleanWord,
          sentence,
          position: {
            x: rect.left,
            y: rect.bottom,
          },
        });
      }, LONG_PRESS_DURATION);
    },
    [getSentenceForWord]
  );

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  // Split paragraph text into words, preserving spaces
  const renderWords = () => {
    if (!currentParagraph) return null;

    const words = currentParagraph.split(/(\s+)/);
    let wordIndex = 0;

    return words.map((segment, i) => {
      // If it's whitespace, render as-is
      if (/^\s+$/.test(segment)) {
        return <span key={`space-${i}`}>{segment}</span>;
      }

      const currentWordIndex = wordIndex;
      wordIndex++;

      return (
        <span
          key={`word-${i}`}
          className="reading-word"
          onPointerDown={(e) => handlePointerDown(e, segment, currentWordIndex)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu on long press
        >
          {segment}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "32px",
      }}
    >
      <div className="paragraph-number">
        Reading
        <span className="longpress-hint">
          <span className="longpress-hint-icon">👆</span>
          Long-press any word for its meaning
        </span>
      </div>
      <div
        className="paragraph-display"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {renderWords()}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginTop: "16px",
        }}
      >
        Take your time to understand this passage
      </div>

      {popup && (
        <WordDefinitionPopup
          word={popup.word}
          sentence={popup.sentence}
          position={popup.position}
          onClose={closePopup}
        />
      )}
    </div>
  );
}

export default ReadScreenNew;
