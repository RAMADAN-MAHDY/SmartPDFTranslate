import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import FileModel from '../schema/FileSchema.js';

const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// إعداد multer
const upload = multer({ storage });
const router = express.Router();

// Endpoint to upload PDF file
router.post("/upload-pdf", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "يرجى رفع ملف PDF." });
    }
    const userId = req.session?.userId;
    const fileId = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    // رفع الملف إلى GridFS
    const conn = mongoose.connection;
    const bucket = new GridFSBucket(conn.db, { bucketName: 'pdfs' });
    const stream = fs.createReadStream(req.file.path);
    const uploadStream = bucket.openUploadStream(req.file.originalname, { metadata: { fileId, userId } });
    stream.pipe(uploadStream)
      .on('error', (err) => {
        console.error('❌ خطأ أثناء رفع الملف إلى GridFS:', err);
        res.status(500).json({ error: 'خطأ أثناء رفع الملف إلى التخزين الدائم.' });
      })
      .on('finish', async () => {
        // حفظ بيانات الملف في MongoDB
        await FileModel.create({
          fileId,
          userId,
          filePath: uploadStream.id.toString(), // نخزن id الخاص بـ GridFS
          uploadedAt: new Date(),
          donePages: [],
        });
        // حذف الملف المؤقت من /tmp أو ./uploads
        fs.unlinkSync(req.file.path);
        res.status(200).json({
          message: "✅ تم رفع الملف بنجاح.",
          fileId,
        });
      });
  } catch (error) {
    console.error("❌ خطأ أثناء رفع الملف:", error);
    res.status(500).json({ error: "حدث خطأ أثناء رفع الملف." });
  }
});

export default router;
