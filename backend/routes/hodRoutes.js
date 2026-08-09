const express = require('express');
const router = express.Router();
const { getFaculty, getDepartments, addDepartment, deleteDepartment, addFaculty, deleteFaculty } = require('../controllers/hodController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('HOD'));

router.get('/faculty', getFaculty);
router.get('/departments', getDepartments);
router.post('/departments', addDepartment);
router.delete('/departments/:id', deleteDepartment);
router.post('/faculty', addFaculty);
router.delete('/faculty/:id', deleteFaculty);

module.exports = router;
