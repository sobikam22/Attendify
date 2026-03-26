const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getSubjects);
router.post('/', authorizeRoles('admin'), createSubject);
router.delete('/:id', authorizeRoles('admin'), deleteSubject);

module.exports = router;
