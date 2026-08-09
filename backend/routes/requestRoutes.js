const express = require('express');
const router = express.Router();
const { requestAccess } = require('../controllers/requestController');

// Public route for unregistered users
router.post('/access', requestAccess);

module.exports = router;
