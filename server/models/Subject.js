const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // e.g., 'Mathematics'
    },
    code: {
        type: String,
        required: true,
        unique: true, // e.g., 'MATH101'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to a teacher in the User collection
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
