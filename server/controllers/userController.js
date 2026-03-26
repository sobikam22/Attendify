const User = require('../models/User');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (Admin only for now, or public if needed)
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Security: Prevent creating 'admin' via public registration
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot register as admin directly.' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log(`[LOGIN ATTEMPT] Email: ${email}`);

        // Find user by email (or username if you were using that, keeping email for now)
        const user = await User.findOne({ email });

        if (!user) {
            console.log('[LOGIN FAILED] User not found');
            return res.status(401).json({ message: 'Invalid email or password' }); 
        }

        const isMatch = await user.matchPassword(password); 
        
        if (!isMatch) {
            console.log('[LOGIN FAILED] Invalid password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log(`[LOGIN SUCCESS] User found: ${user.name} (${user.role})`);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users/add
// @access  Private (Admin)
const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role // Admin can assign any role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cascading deletes
        if (user.role === 'teacher') {
            // Find subjects taught by teacher
            const subjects = await Subject.find({ teacher: user._id });
            const subjectIds = subjects.map(s => s._id);

            // Delete attendance for these subjects
            await Attendance.deleteMany({ subject: { $in: subjectIds } });
            
            // Delete the subjects
            await Subject.deleteMany({ teacher: user._id });

            // Find students assigned to this teacher
            const students = await Student.find({ assignedTeacher: user._id });
            const studentIds = students.map(s => s._id);

            // Pull these students from any remaining attendance records
            await Attendance.updateMany(
                {}, 
                { $pull: { records: { student: { $in: studentIds } } } }
            );

            // Delete these student profiles
            await Student.deleteMany({ assignedTeacher: user._id });
        } else if (user.role === 'student') {
            // Delete their student profile
            const studentProfile = await Student.findOne({ email: user.email });
            if (studentProfile) {
                await Attendance.updateMany(
                    {}, 
                    { $pull: { records: { student: studentProfile._id } } }
                );
                await studentProfile.deleteOne();
            }
        }

        await user.deleteOne();
        res.json({ message: 'User and all related records removed' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isActive = req.body.isActive;
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, isActive: updatedUser.isActive });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, authUser, getUsers, createUser, deleteUser, updateUserStatus };
