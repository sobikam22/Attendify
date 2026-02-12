const Student = require('../models/Student');

// @desc    Get all students (Admin: All, Teacher: Assigned)
// @route   GET /api/students
// @access  Private (Admin/Teacher)
const getStudents = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'teacher') {
            query.assignedTeacher = req.user._id;
        }
        const students = await Student.find(query).populate('assignedTeacher', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Import User model
const User = require('../models/User');

// @desc    Create a student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
    const { name, rollNumber, batch, contact, email, assignedTeacher } = req.body;

    try {
        const studentExists = await Student.findOne({ rollNumber });

        if (studentExists) {
            return res.status(400).json({ message: 'Student with this Roll Number already exists' });
        }

        // 1. Check or Create User Account
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`[Create Student] Creating new User account for ${email}`);
            user = await User.create({
                name,
                email,
                password: 'password123', // Default password
                role: 'student'
            });
        } else {
            console.log(`[Create Student] Linking to existing User account: ${user._id}`);
        }

        // 2. Create Student Profile linked to User
        const student = await Student.create({
            name,
            rollNumber,
            batch,
            contact,
            email,
            assignedTeacher,
            user: user._id // Link strict
        });

        res.status(201).json(student);
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private (Admin/Teacher)
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            student.name = req.body.name || student.name;
            student.rollNumber = req.body.rollNumber || student.rollNumber;
            student.batch = req.body.batch || student.batch;
            student.contact = req.body.contact || student.contact;
            student.email = req.body.email || student.email;

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            await student.deleteOne();
            res.json({ message: 'Student removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent
};
