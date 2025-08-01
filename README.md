# 🧠 أداة ترجمة ملفات PDF باستخدام الذكاء الاصطناعي

مرحبًا بك في مستند توثيق أداة ترجمة ملفات PDF!  
تتيح هذه الأداة رفع ملفات PDF، وترجمتها باستخدام الذكاء الاصطناعي (Google Gemini)، ثم تحميل النص أو ملف Word الناتج.

[⬇️ English Version](#ai-pdf-translator-tool-documentation)

---

## ⚙️ المميزات
- رفع ملفات PDF بأمان
- ترجمة المحتوى للعربية باستخدام Google Gemini AI
- تحميل النص المترجم كـ TXT أو Word (DOCX)
- إدارة الجلسات تلقائيًا
- لوحة تحكم سهلة الاستخدام

---

## 👤 للمستخدم العادي
1. انتقل إلى `/dashboard`
2. ارفع ملف الـ PDF باستخدام النموذج
3. اضغط على "Translate Next 2 Pages" لترجمة صفحتين في كل مرة
4. قم بتحميل الترجمة كـ TXT أو توليد ملف Word
5. معرف الجلسة يظهر في الأسفل للرجوع إليه

---

## 🧑‍💻 لمطوري الواجهة الأمامية (Frontend)
- تم بناء الواجهة باستخدام EJS و JavaScript
- يتم رفع الملفات باستخدام FormData و `fetch`
- يتم تخزين `fileId` في `localStorage` لاستخدامه لاحقًا
- تُرسل طلبات الترجمة وتوليد Word بصيغة JSON
- يتم تحديث روابط التحميل تلقائيًا بعد كل عملية

---

## 🧑‍💻 لمطوري الواجهة الخلفية (Backend)
- مبني باستخدام Node.js, Express, MongoDB و GridFS
- أهم المسارات:
  - `/upload/upload-pdf`
  - `/ai/translate`
  - `/ai/translate/generate-word`
- إدارة الجلسات باستخدام `iron-session`
- استخراج النص من PDF باستخدام `pdfjs-dist`
- الترجمة باستخدام `@google/genai` (Google Gemini)
- يتم تخزين بيانات الملفات في MongoDB

---

## 🔧 المتطلبات البيئية
قم بإنشاء ملف `.env` يحتوي على المتغيرات التالية:
```bash
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
session_secret_key=your_session_secret
```
---

## 🚀 التثبيت والتشغيل
1. تثبيت الحزم:
```

npm install

```
2. تشغيل الخادم:
```

npm run dev

```
3. افتح [http://localhost:4000/dashboard](http://localhost:4000/dashboard)

---

## 🧪 المشاكل الشائعة
- **400 Bad Request** أو **"يجب إرسال fileId"**: تأكد من إرسال `fileId` في الطلب
- مشاكل الجلسة: تأكد من تفعيل الكوكيز
- تعذر رفع الملف: تأكد من حجم ونوع الملف

---

# AI PDF Translator Tool Documentation

## Overview
This tool enables users to upload PDF files, translate their content using AI (Google Gemini), and download the translated text or a generated Word file. It is designed for easy integration and use by frontend developers, backend developers, and end users.

## 📑 Table of Contents
- Features
- For End Users
- For Frontend Developers
- For Backend Developers
- Project Structure
- Environment Variables
- Installation & Running
- API Endpoints
- Troubleshooting

## Features
- Upload PDF files securely
- Translate PDF content to Arabic using Google Gemini AI
- Download translated text as TXT or Word (DOCX)
- User session management
- Simple dashboard interface

## For End Users
1. Go to `/dashboard`
2. Upload your PDF file using the form
3. Click "Translate Next 2 Pages" to translate pages in batches
4. Download the translated TXT or generate a Word file
5. Your session ID is shown at the bottom for reference

## For Frontend Developers
- The dashboard is built with EJS and vanilla JS (`views/dashboard.ejs`)
- File uploads use FormData and fetch API
- After upload, the `fileId` is stored in localStorage and used for subsequent translation/generation requests
- Translation and Word generation requests are sent as JSON POST requests with `{ fileId }` in the body
- Download links are dynamically updated after each operation

## For Backend Developers
- Built with Node.js, Express, MongoDB (Mongoose), and GridFS for file storage
- Main routes:
- `/upload/upload-pdf` (PDF upload)
- `/ai/translate` (Translate next 2 pages)
- `/ai/translate/generate-word` (Generate Word file)
- Session management uses `iron-session`
- PDF text extraction uses `pdfjs-dist`
- AI translation uses `@google/genai` (Google Gemini API)
- File metadata is stored in MongoDB (`schema/FileSchema.js`)
- All routes require a valid `fileId`

## Environment Variables
Create a `.env` file with:

```bash
GEMINI_API_KEY=your_google_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
session_secret_key=your_session_secret
```

## Installation & Running
1. Install dependencies:
```

npm install

```
2. Start the server:
```

npm run dev

```
3. Visit `http://localhost:4000/dashboard`

## API Endpoints
- `POST /upload/upload-pdf`: Upload a PDF file (`FormData`, field: `pdfFile`). Returns `{ fileId }`.
- `POST /ai/translate`: Translate next 2 pages. Body: `{ fileId }`. Returns download link for TXT.
- `POST /ai/translate/generate-word`: Generate Word file. Body: `{ fileId }`. Returns download link for DOCX.
- `GET /whoami`: Returns current session user ID.

## Troubleshooting
- `400 Bad Request` / `"fileId is required"`: Make sure `fileId` is sent in the request body.
- Session issues: Ensure cookies are enabled and not cleared between requests.
- PDF not uploading: Check file size and format.

---

For questions or contributions, feel free to contact the project maintainer.
---
