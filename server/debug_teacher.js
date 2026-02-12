const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Student = require('./models/Student');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-app');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const debugTeacher = async () => {
    await connectDB();

    try {
        // 1. Find User 'leela' (case insensitive regex)
        const user = await User.findOne({ name: { $regex: 'leela', $options: 'i' } });

        if (!user) {
            console.log('❌ User "leela" not found in database.');
        } else {
            console.log('✅ User found:', user.name, user.email, user.role);
            console.log('ID:', user._id);

            // 2. Find Subjects
            const subjects = await Subject.find({ teacher: user._id });
            console.log(`📚 Subjects assigned: ${subjects.length}`);
            subjects.forEach(s => console.log(` - ${s.name} (${s.code})`));

            // 3. Find Students
            const students = await Student.find({ assignedTeacher: user._id });
            console.log(`🎓 Students assigned: ${students.length}`);
            students.forEach(s => console.log(` - ${s.name} (${s.rollNumber})`));
        }

    } catch (error) {
        console.error(error);
    } finally {
        mongoose.disconnect();
    }
};

debugTeacher();
