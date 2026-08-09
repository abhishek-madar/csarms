const express = require('express');
const router = express.Router();
const { getSystemStats, getHODs, addHOD, deleteHOD } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/system-stats', getSystemStats);
router.get('/hods', getHODs);
router.post('/hods', addHOD);
router.delete('/hods/:id', deleteHOD);

module.exports = router;
