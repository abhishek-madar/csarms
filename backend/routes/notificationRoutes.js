const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, deleteNotification } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// Ensure uploads directory exists - Using /tmp on Vercel as it's the only writable directory
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel 
  ? path.join('/tmp', 'uploads') 
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.use(protect);

router.get('/', getNotifications);
// Admin, Faculty, and HOD can create announcements
router.post('/', authorize('Admin', 'Faculty', 'HOD'), upload.single('media'), createNotification);
router.delete('/:id', authorize('Admin', 'Faculty', 'HOD'), deleteNotification);

module.exports = router;
