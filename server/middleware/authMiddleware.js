const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // TEMPORARY: Skip signature verification
            // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            console.log('[DEV MODE] Skipping token signature verification');
            const decoded = jwt.decode(token); // Just decode, don't verify

            if (decoded && decoded.id) {
                req.user = await User.findById(decoded.id).select('-password');
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, token failed (decode error)' });
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Generic Role Middleware
// Usage: authorizeRoles('admin', 'teacher')
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }
        next();
    };
};

// Specific Role Middleware (Aliases for readability)
const allowAdmin = authorizeRoles('admin');
const allowTeacher = authorizeRoles('teacher');
const allowStudent = authorizeRoles('student');

module.exports = {
    verifyToken,
    authorizeRoles,
    allowAdmin,
    allowTeacher,
    allowStudent
};
