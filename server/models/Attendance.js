const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject', // Links to the Subject collection
        required: true,
    },
    records: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student', // Links to the Student collection
                required: true,
            },
            status: {
                type: String,
                enum: ['Present', 'Absent', 'Late'],
                required: true,
            }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);
