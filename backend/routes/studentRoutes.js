const express = require('express');
const router = express.Router();
const { getStudentRecords, getAttendanceSummary, getDetailedAttendance } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Student'));

router.get('/records', getStudentRecords);
router.get('/attendance/summary', getAttendanceSummary);
router.get('/attendance/detailed', getDetailedAttendance);

module.exports = router;
