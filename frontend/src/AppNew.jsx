import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/landing-page.css";
import LandingPage from "./components/LandingPage";
import FileUpload from "./components/FileUploadNew";
import GuidedReadingNew from "./reading/GuidedReadingNew";

import { parseTxt } from "./utils/parseTxt";
import { parsePdf } from "./utils/parsePdf";
import { splitParagraphs } from "./utils/splitParagraph";

function App() {
  const [document, setDocument] = useState(() => {
    const saved = localStorage.getItem("document");
    return saved ? JSON.parse(saved) : null;
  });

  const [showLanding, setShowLanding] = useState(() => {
    // Show landing page only if there's no document loaded
    const saved = localStorage.getItem("document");
    return !saved;
  });

  const [error, setError] = useState("");

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
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        rawText: extractedText,
        paragraphs,

        orientationCompleted: true,
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

  const handleClearDocument = () => {
    localStorage.removeItem("document");
    setDocument(null);
    setError("");
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // Show landing page
  if (showLanding && !document) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div
            className="app-logo"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (!document) setShowLanding(true);
            }}
          >
            📖 ReadFlow
          </div>
          {document && (
            <div className="header-actions">
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {document.fileName}
              </span>
              <button className="btn-secondary btn-sm" onClick={handleClearDocument}>
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

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

      {/* Main Content */}
      <main className="app-main">
        {!document && (
          <div className="container">
            <FileUpload
              onFileProcessed={handleFileProcessed}
              setError={setError}
              error={error}
            />
          </div>
        )}

        {document && (
          <GuidedReadingNew
            document={document}
            setDocument={setDocument}
            onClearDocument={handleClearDocument}
          />
        )}
      </main>
    </div>
  );
}

export default App;
