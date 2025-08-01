import fs from 'fs';
import path from 'path';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// تحميل PDF من ملف
const extractPagesFromPDF = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const pagesText = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map(item => item.str).join(' ');
    pagesText.push(pageText);
  }

  return pagesText; // ده array فيه نص كل صفحة
};

export default extractPagesFromPDF;
// مثال على الاستخدام

