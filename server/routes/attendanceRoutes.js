const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceByStudent,
    getSubjectAttendance
} = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', verifyToken, authorizeRoles('teacher', 'admin'), markAttendance);
router.get('/student/:studentId', verifyToken, authorizeRoles('teacher', 'admin', 'student'), getAttendanceByStudent);
router.get('/subject/:subjectId', verifyToken, authorizeRoles('teacher', 'admin'), getSubjectAttendance);

module.exports = router;
