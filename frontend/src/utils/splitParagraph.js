export const splitParagraphs = (text) => {
  if (!text) return [];

  return text
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    // Split on ONE OR MORE blank lines
    .split(/\n\s*\n+/)
    // Trim each paragraph
    .map(p => p.trim())
    // Remove empty paragraphs
    .filter(p => p.length > 0);
};
