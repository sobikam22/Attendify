const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUsers, createUser, deleteUser } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);

// --- Example Protected Routes ---
router.get('/admin-only', verifyToken, authorizeRoles('admin'), (req, res) => {
    res.send('Admin access granted');
});

router.get('/teacher-only', verifyToken, authorizeRoles('teacher', 'admin'), (req, res) => {
    res.send('Teacher access granted');
});

router.get('/student-dashboard', verifyToken, authorizeRoles('student', 'teacher', 'admin'), (req, res) => {
    res.send('Student dashboard access granted');
});

// Admin User Management
router.get('/', verifyToken, authorizeRoles('admin'), getUsers);
router.post('/add', verifyToken, authorizeRoles('admin'), createUser);
router.patch('/:id/status', verifyToken, authorizeRoles('admin'), require('../controllers/userController').updateUserStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteUser);

module.exports = router;
