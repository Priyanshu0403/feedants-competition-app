const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

// NOTE: in production this would upload straight to S3/Cloudinary via a
// signed URL instead of the app server's local disk — see README.
const ALLOWED_MIME = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

module.exports = upload;
