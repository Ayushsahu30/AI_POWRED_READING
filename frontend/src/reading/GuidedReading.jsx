import ReadScreen from "./ReadScreen";
import SelfAssessment from "./SelfAssessment";
import ClarifyLevel1 from "./ClarifyLevel1";
import ClarifyLevel2 from "./ClarifyLevel2";
import TeachBack from "./TeachBack";
import LastChance from "./LastChance";
import SkipScreen from "./SkipScreen";
import ReadingCompleteModal from "../components/ReadingCompleteModal";

import { generateLastChance } from "../api";
import { toast } from "react-toastify";

function GuidedReading({ document, setDocument }) {

  const { paragraphs, paragraphMeta, readingProgress } = document;
  const { paragraphIndex, screen } = readingProgress;

  const paragraph = paragraphs[paragraphIndex];

  const updateDocument = (updates) => {
    const updated = { ...document, ...updates };
    localStorage.setItem("document", JSON.stringify(updated));
    setDocument(updated);
  };

  const updateProgress = (updates) => {
    updateDocument({
      readingProgress: {
        ...readingProgress,
        ...updates
      }
    });
  };

  const goBackToUpload = () => {
    localStorage.removeItem("document");
    setDocument(null);
  };

  const goNextParagraph = () => {
    if (paragraphIndex < paragraphs.length - 1) {
      updateProgress({
        paragraphIndex: paragraphIndex + 1,
        screen: "read",
        highestClarificationLevel: 0,
        hasUsedLastChance: false
      });
    } else {
      updateProgress({ screen: "readingComplete" });
    }
  };

  const handleNotAccepted = async () => {

  const currentMeta = paragraphMeta[paragraphIndex];

  if (
    readingProgress.highestClarificationLevel > 0 &&
    !readingProgress.hasUsedLastChance
  ) {

    // If not generated yet
    if (!currentMeta.lastChanceGenerated) {

      // Show loading screen
      updateProgress({ screen: "generatingLastChance" });

      try {
        const result = await generateLastChance(paragraph);

        if (!result.variants || result.variants.length !== 10) {
          alert("Last chance generation failed.");
          updateProgress({ screen: "teach" });
          return;
        }

        const updatedMeta = [...paragraphMeta];

        updatedMeta[paragraphIndex] = {
          ...currentMeta,
          lastChanceVariants: result.variants,
          lastChanceGenerated: true
        };

        updateDocument({
          paragraphMeta: updatedMeta,
          readingProgress: {
            ...readingProgress,
            screen: "lastChance",
            hasUsedLastChance: true
          }
        });
      } catch (error) {
        alert("Error generating explanations. Please try again.");
        updateProgress({ screen: "teach" });
      }

      return;
    }

    // Already generated
    updateProgress({
      screen: "lastChance",
      hasUsedLastChance: true
    });

  } else {
    updateProgress({ screen: "skipMessage" });
  }
};

  const handleSkip = () => {

    const updatedMeta = [...paragraphMeta];
    updatedMeta[paragraphIndex].unclear = true;

    if (!readingProgress.skipInfoShown) {
      toast.error("This section has been marked so you can return to it later.");
      updateProgress({ skipInfoShown: true });
    }

    updateDocument({ paragraphMeta: updatedMeta });
    goNextParagraph();
  };

  switch (screen) {

    case "read":
      return (
        <ReadScreen
          paragraph={paragraph}
          index={paragraphIndex}
          onContinue={() => updateProgress({ screen: "self" })}
        />
      );

    case "self":
  return (
    <SelfAssessment
      onUnderstand={goNextParagraph}
      onNeedHelp={() =>
        updateProgress({
          screen: "clarify1",
          highestClarificationLevel: 1
        })
      }
    />
  );


    case "clarify1":
      return (
        <ClarifyLevel1
          paragraph={paragraph}
          onMore={() =>
            updateProgress({
              screen: "clarify2",
              highestClarificationLevel: 2
            })
          }
          onContinue={() => updateProgress({ screen: "teach" })}
        />
      );

    case "clarify2":
      return (
        <ClarifyLevel2
          paragraph={paragraph}
          onContinue={() => updateProgress({ screen: "teach" })}
        />
      );

    case "teach":
      return (
        <TeachBack
          paragraph={paragraph}
          onAccepted={goNextParagraph}
          onNotAccepted={handleNotAccepted}
        />
      );

    case "lastChance":
      return (
        <LastChance
          paragraph={paragraph}
          variants={paragraphMeta[paragraphIndex].lastChanceVariants}
          onRetry={() => updateProgress({ screen: "teach" })}
        />
      );

    case "skipMessage":
      return (
        <SkipScreen onSkip={handleSkip} />
      );

    case "readingComplete":
      return (
        <ReadingCompleteModal
          message="🎉 Reading Done!"
          onClose={goBackToUpload}
        />
      );

    case "generatingLastChance":
      return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-text">
              <p>Explanation was incorrect...</p>
              <p>Generating 10 more explanations for you...</p>
            </div>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <div style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: "4px solid #e0e0e0",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
            </div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );

    default:
      return null;
  }
}

export default GuidedReading;
