import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { Document, Packer, Paragraph, TextRun } from "docx";
// إعداد multer لحفظ الملفات في مجلد محلي
const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage });



const router = express.Router();

const generateWordFile = async (textPath, wordPath) => {
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
};

router.get("/generate-word", upload.single("fileTextToWord") , async (req, res) => {

     if (!req.file) {
    return res.status(400).send("No file uploaded.");
  } 
 
 const filePath = req.file.path; // مسار الملف اللي اترفع (مؤقت)
  const textPath = path.resolve(filePath);
  const wordPath = path.resolve("./tmp/translated_output.docx");

  if (!fs.existsSync(textPath)) {
    return res.status(404).send("⚠️ ملف النص غير موجود.");
  }

  try {
    await generateWordFile(textPath, wordPath);
    return res.json({
      message: "✅ تم توليد ملف Word بنجاح.",
      downloadUrl: "/ai/translate/download-word"
    });
  } catch (err) {
    console.error("❌ خطأ أثناء توليد ملف Word:", err);
    return res.status(500).send("حدث خطأ أثناء توليد الملف.");
  }
});

export default router;
