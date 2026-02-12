const Subject = require('../models/Subject');

// @desc    Get all subjects (Admin: All, Teacher: Assigned)
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
    try {
        let query = {};
        // If user is a teacher, only return subjects assigned to them
        if (req.user.role === 'teacher') {
            query.teacher = req.user._id;
        }

        const subjects = await Subject.find(query).populate('teacher', 'name email');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
    const { name, code, teacher } = req.body;

    try {
        const subject = await Subject.create({
            name,
            code,
            teacher
        });
        res.status(201).json(subject);
    } catch (error) {
        console.error('[Create Subject Error]', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSubjects, createSubject };
