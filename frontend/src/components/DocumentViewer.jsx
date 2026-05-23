function DocumentViewer({ document }) {
  return (
    <div className="document-view">

      <div className="doc-meta">
        <span>Total paragraphs</span>
        <strong>{document.paragraphs.length}</strong>
      </div>

      <div className="paragraph-box">
        <h3>Paragraph 1</h3>
        <p>{document.paragraphs[0]}</p>
      </div>

    </div>
  );
}

export default DocumentViewer;
