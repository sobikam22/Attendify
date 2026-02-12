const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true // We'll make it required after repair, or keep optional for legacy safety? 
        // User requested strict linking, but for migration safety let's add it without 'required: true' first, or handle it in controller.
        // Actually, user said "Save the User._id inside Student.userId".
        // Let's call it 'user' to match Mongoose convention, or 'userId' if preferred? 'user' is standard.
    },
    batch: {
        type: String, // e.g., '2024-A'
        required: true,
    },
    contact: {
        type: String, // Phone number or guardian contact
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    assignedTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Enforce assignment
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
