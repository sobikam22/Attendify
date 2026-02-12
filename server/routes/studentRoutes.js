const express = require('express');
const router = express.Router();
const {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All routes here are protected
router.use(verifyToken);

router.route('/')
    .get(authorizeRoles('admin', 'teacher'), getStudents)
    .post(authorizeRoles('admin'), createStudent); // Only Admin can create new students

router.route('/:id')
    .put(authorizeRoles('admin', 'teacher'), updateStudent)
    .delete(authorizeRoles('admin'), deleteStudent); // Only Admin can delete

module.exports = router;
