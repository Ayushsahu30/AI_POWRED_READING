import { useState } from "react";

function FileUploadNew({ onFileProcessed, setError, error }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = ["text/plain", "application/pdf"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only TXT and text-selectable PDF files are supported.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    onFileProcessed(selectedFile);
  };

  return (
    <div className="upload-section">
      <div className="upload-header">
        <h1 className="upload-title">Start Reading</h1>
        <p className="upload-subtitle">Upload a TXT or PDF file to begin your guided reading experience</p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      <div
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div className="upload-icon">📄</div>
        <p className="upload-text">
          {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop your file here"}
        </p>
        <p className="upload-hint">or click to browse</p>
        <input
          id="file-input"
          type="file"
          accept=".txt,.pdf"
          onChange={handleChange}
        />
      </div>

      <div className="button-group">
        <button
          className="btn-primary btn-lg"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          Upload & Start Reading
        </button>
      </div>

      <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "8px" }}>
          ✓ Supported formats: .txt, PDF (text-selectable)
        </p>
      </div>
    </div>
  );
}

export default FileUploadNew;
