const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkTeacher = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-app');
        console.log('MongoDB Connected');

        const teacher = await User.findOne({
            $or: [
                { name: { $regex: 'leela', $options: 'i' } },
                { role: 'teacher' }
            ]
        });

        if (!teacher) {
            console.log('❌ No teacher found.');
        } else {
            console.log('✅ Teacher Found:');
            console.log('Name:', teacher.name);
            console.log('Email:', teacher.email);
            console.log('Role:', teacher.role);
            console.log('Password (Hash):', teacher.password ? 'Present' : 'Missing');
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

checkTeacher();
