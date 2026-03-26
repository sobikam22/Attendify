const express = require('express');
const router = express.Router();
const { analyzeAttendance } = require('../controllers/aiController');

// POST /api/ai/analyze-attendance
router.post('/analyze-attendance', analyzeAttendance);

module.exports = router;
