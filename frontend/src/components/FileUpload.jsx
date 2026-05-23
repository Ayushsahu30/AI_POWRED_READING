import { useState } from "react";

function FileUpload({ onFileProcessed, setError }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["text/plain", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only TXT and text-selectable PDF files are supported.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    onFileProcessed(selectedFile);
  };

  return (
    <div className="upload-box">
      <div className="upload-title">Upload your document</div>
      <div className="upload-hint">
        Supported formats: .txt, text-selectable .pdf
      </div>

      <input type="file" accept=".txt,.pdf" onChange={handleFileSelect} />

      <button className="primary-btn" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}

export default FileUpload;
