// middleware/upload.js
// This file configures multer — a library that handles file uploads.
// When a student attaches a file to a request, multer reads the file
// from the incoming HTTP request and saves it to the server/uploads/ folder.

const multer = require('multer');
const path = require('path');

// --- Storage configuration ---
// diskStorage tells multer to save files to disk (not memory)
const storage = multer.diskStorage({
  // destination: which folder to save uploaded files in
  destination: (req, file, cb) => {
    // cb stands for "callback" — we call it with (error, folder path)
    cb(null, path.join(__dirname, '../../uploads'));
  },

  // filename: what to name the file on disk
  filename: (req, file, cb) => {
    // We create a unique name using the current timestamp + original name
    // Example: 1719150000000-screenshot.png
    // This prevents two files with the same name overwriting each other
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

// --- File filter ---
// Only allow images and PDFs — reject everything else
function fileFilter(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    // Reject the file with an error message
    cb(new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed.'), false);
  }
}

// --- Create the multer instance ---
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size (5 * 1024 * 1024 bytes)
  },
});

module.exports = { upload };
