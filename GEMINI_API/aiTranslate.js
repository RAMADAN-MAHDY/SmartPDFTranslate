import express from "express";
import  fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import extractPagesFromPDF from './extractTexetfromPdf.js';
import dotenv from "dotenv";
import multer from "multer";
import { Document, Packer, Paragraph, TextRun } from "docx";

dotenv.config();


const upload = multer({ dest: "uploads/" });

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemPrompt = `
أنت مترجم محترف. ترجم فقط النص من اللغة الإنجليزية إلى اللغة العربية بدقة وبدون أي تعليقات أو إضافات. لا تفسر، لا توضح، فقط ترجم كما هو.
`;

const runAiTranslation = async (text) => {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: systemPrompt + '\n' + text }] }
        ],
        generationConfig: { maxOutputTokens: 1000 }
    });

    return result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || '';
};

router.post("/translate", async (req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({ error: "يجب إرسال fileId مع الطلب." });
        }
        const metadataFile = path.resolve("./uploads/metadata.json");
        if (!fs.existsSync(metadataFile)) {
            return res.status(404).json({ error: "لم يتم العثور على ملفات مرفوعة." });
        }
        const metadata = JSON.parse(fs.readFileSync(metadataFile));
        const fileIndex = metadata.findIndex(meta => meta.fileId === fileId);
        if (fileIndex === -1) {
            return res.status(404).json({ error: "لا يوجد ملف بهذا المعرف. إذا رفعت ملف جديد، تأكد أن المتصفح لم يمسح بياناته أو أعد رفع الملف." });
        }
        const userFile = metadata[fileIndex];
        const filePath = userFile.filePath;
        const pages = await extractPagesFromPDF(filePath);
        const outputFilePath = './tmp/translated_output.txt';
        // ✅ إيجاد أول صفحتين غير مترجمين لهذا الملف
        let startIndex = null;
        let pageRange = "";
        const donePages = userFile.donePages || [];
        for (let i = 0; i < pages.length; i += 2) {
            const currentRange = `${i + 1}-${i + (pages[i + 1] ? 2 : 1)}`;
            if (!donePages.includes(currentRange)) {
                startIndex = i;
                pageRange = currentRange;
                break;
            }
        }
        if (startIndex === null) {
            return res.json({ message: "✅ جميع الصفحات تم ترجمتها بالفعل.", donePages });
        }
        const page1 = pages[startIndex];
        const page2 = pages[startIndex + 1] || '';
        const combinedText = page1 + '\n' + page2;
        console.log(`⏳ ترجمة الصفحات: ${pageRange}`);
        const translated = await runAiTranslation(combinedText);
        const outputEntry = `--- الصفحات ${pageRange} ---\n${translated}\n\n`;
        fs.appendFileSync(outputFilePath, outputEntry);
        // تحديث donePages لهذا الملف فقط
        userFile.donePages = [...donePages, pageRange];
        metadata[fileIndex] = userFile;
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
        res.json({
            message: `✅ تم ترجمة الصفحات ${pageRange}.`,
            translatedPages: pageRange,
            downloadUrl: "/ai/translate/download",
            downloadUrlword: "/ai/translate/download-word",
        });
    } catch (err) {
        console.error("❌ خطأ أثناء الترجمة:", err);
        res.status(500).json({ error: "حدث خطأ أثناء الترجمة." });
    }
});

// 🎯 endpoint لتحميل الترجمة
router.get("/translate/download", (req, res) => {
    const filePath = path.resolve('./tmp/translated_output.txt');

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("⚠️ ملف الترجمة غير موجود بعد.");
    }

    res.download(filePath, "translated_output.txt");
});


router.get("/translate/download-word", (req, res) => {
  const filePath = path.resolve('./tmp/translated_output.docx');
  if (!fs.existsSync(filePath)) return res.status(404).send("⚠️ ملف وورد غير موجود.");
  res.download(filePath, "translated_output.docx");
});

// Endpoint لإنشاء ملف Word من الترجمة النصية
router.post("/translate/generate-word", async (req, res) => {
  try {
    const textPath = path.resolve("./tmp/translated_output.txt");
    const wordPath = path.resolve("./tmp/translated_output.docx");
    if (!fs.existsSync(textPath)) {
      return res.status(404).json({ error: "⚠️ ملف الترجمة النصية غير موجود." });
    }
    const translatedText = fs.readFileSync(textPath, "utf-8");
    const doc = new Document({
      sections: [{
        properties: {},
        children: translatedText
          .split('\n')
          .map(line => new Paragraph({ children: [new TextRun(line)] }))
      }]
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(wordPath, buffer);
    return res.json({
      message: "✅ تم توليد ملف Word بنجاح.",
      downloadUrl: "/ai/translate/download-word"
    });
  } catch (err) {
    console.error("❌ خطأ أثناء توليد ملف Word:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء توليد الملف." });
  }
});

export default router;
