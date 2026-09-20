const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');

const uploadDir = path.join(__dirname, '..', 'data', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Formato de imagen no soportado'));
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});
