const express = require('express');
const router = express.Router();
const {
    getClassAnalytics,
    getMonthlySummary,
    getSubjectAnalytics,
    getMyStats
} = require('../controllers/analyticsController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/class-report', verifyToken, authorizeRoles('teacher', 'admin', 'student'), getClassAnalytics);
router.get('/monthly', verifyToken, authorizeRoles('teacher', 'admin', 'student'), getMonthlySummary);
router.get('/subjects', verifyToken, authorizeRoles('teacher', 'admin', 'student'), getSubjectAnalytics);

// Protected Student Route
router.get('/student/me', verifyToken, authorizeRoles('student'), getMyStats);

module.exports = router;
