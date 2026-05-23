import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FileUpload from "./components/FileUpload";
import OrientationScreen from "./components/OrientationScreen";
import GuidedReading from "./reading/GuidedReading";

import { parseTxt } from "./utils/parseTxt";
import { parsePdf } from "./utils/parsePdf";
import { splitParagraphs } from "./utils/splitParagraph";

function App() {

  const [document, setDocument] = useState(() => {
    const saved = localStorage.getItem("document");
    return saved ? JSON.parse(saved) : null;
  });

  const [error, setError] = useState("");

  const orientationCompleted = document?.orientationCompleted ?? false;

  // Upload file
  const handleFileProcessed = async (file) => {
    try {
      setError("");

      let extractedText = "";

      if (file.type === "text/plain") {
        extractedText = await parseTxt(file);
      } else if (file.type === "application/pdf") {
        extractedText = await parsePdf(file);
      } else {
        setError("Unsupported file type.");
        return;
      }

      const paragraphs = splitParagraphs(extractedText);

      const data = {
        rawText: extractedText,
        paragraphs,

        orientationCompleted: true,  // Skip orientation, go directly to reading
        orientationSimplified: false,

        readingProgress: {
          paragraphIndex: 0,
          screen: "read",
          highestClarificationLevel: 0,
          hasUsedLastChance: false,
          skipInfoShown: false
        },

     paragraphMeta: paragraphs.map(() => ({
  unclear: false,
  lastChanceVariants: null,
  lastChanceGenerated: false
}))

      };

      localStorage.setItem("document", JSON.stringify(data));
      setDocument(data);

    } catch {
      setError("This PDF appears to be scanned. OCR not supported.");
    }
  };

  // const handleOrientationContinue = () => {
  //   const updated = {
  //     ...document,
  //     orientationCompleted: true
  //   };
  //
  //   localStorage.setItem("document", JSON.stringify(updated));
  //   setDocument(updated);
  // };

  // const handleBackToOrientation = () => {
  //   const updated = {
  //     ...document,
  //     orientationCompleted: false
  //   };
  //
  //   localStorage.setItem("document", JSON.stringify(updated));
  //   setDocument(updated);
  // };

  const toggleSimplified = () => {
    const updated = {
      ...document,
      orientationSimplified: !document.orientationSimplified
    };

    localStorage.setItem("document", JSON.stringify(updated));
    setDocument(updated);
  };

  const handleClearDocument = () => {
    localStorage.removeItem("document");
    setDocument(null);
    setError("");
  };

  return (
    <div className="app-wrapper">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="app-card">

        {document && (
          <div className="top-actions">

            {/* Orientation back button - disabled for now */}
            {/* {orientationCompleted && (
              <button
                className="secondary-btn small-btn"
                onClick={handleBackToOrientation}
              >
                ← Orientation
              </button>
            )} */}

            <button
              className="danger-btn small-btn"
              onClick={handleClearDocument}
            >
              Clear
            </button>

          </div>
        )}

        <h1>Reading Workflow Prototype</h1>

        {!document && (
          <FileUpload
            onFileProcessed={handleFileProcessed}
            setError={setError}
          />
        )}

        {error && <div className="error-box">{error}</div>}

        {/* Orientation screen - commented out to skip orientation and go directly to reading */}
        {/* {document && !orientationCompleted && (
          <OrientationScreen
            onContinue={handleOrientationContinue}
            showSimplified={document.orientationSimplified}
            onToggleSimplified={toggleSimplified}
          />
        )} */}

        {document && orientationCompleted && (
          <GuidedReading
            document={document}
            setDocument={setDocument}
          />
        )}

      </div>
    </div>
  );
}

export default App;
