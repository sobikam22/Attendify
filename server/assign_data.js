const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Student = require('./models/Student');
require('dotenv').config();

const assignData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-app');
        console.log('MongoDB Connected');

        // 1. Find 'leela'
        const teacher = await User.findOne({ name: { $regex: 'leela', $options: 'i' } });
        if (!teacher) {
            console.log('❌ User "leela" not found.');
            return;
        }

        // 2. Create Subject
        const subject = new Subject({
            name: 'Advanced Mathematics',
            code: 'MATH-202',
            teacher: teacher._id
        });
        await subject.save();
        console.log('✅ Subject Created:', subject.name);

        // 3. Create Student
        const student = new Student({
            name: 'Demo Student',
            rollNumber: 'DEMO-001',
            batch: '2024-B',
            email: 'demo@student.com',
            assignedTeacher: teacher._id
        });
        await student.save();
        console.log('✅ Student Created:', student.name);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

assignData();
