const { Router } = require('express');
const UploadController = require('./controller');
const multer = require('multer');
const path = require('path');

const router = Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// File Type Filter: Only Accept CSV
const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() !== '.csv') {
    return cb(new Error('Only CSV files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), UploadController.uploadCSV);
router.get('/status/:reqId', UploadController.status);

module.exports = router;
