import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const parsePdf = async (file) => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let lastY = null;

    content.items.forEach(item => {
      const y = item.transform[5];

      if (lastY !== null) {
        const gap = Math.abs(lastY - y);

        // 🔹 paragraph break
        if (gap > 25) {
          fullText += "\n\n";
        }
        // 🔹 line break
        else if (gap > 10) {
          fullText += "\n";
        }
        else {
          fullText += " ";
        }
      }

      fullText += item.str;
      lastY = y;
    });

    fullText += "\n\n";
  }

  if (!fullText.trim()) {
    throw new Error("SCANNED_PDF");
  }

  return fullText;
};
