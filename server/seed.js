const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const User = require('./models/User');

const seedData = async () => {
    try {
        console.log('Cleaning existing data...');
        await Student.deleteMany();
        await Subject.deleteMany();
        await Attendance.deleteMany();
        await User.deleteMany(); // Clear users too

        console.log('Adding Users...');
        // 1. Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // 2. Create Teacher
        const teacherUser = await User.create({
            name: 'John Teacher',
            email: 'teacher1@test.com',
            password: 'password123',
            role: 'teacher'
        });

        // 3. Create Student User
        const studentUser = await User.create({
            name: 'Alice Johnson',
            email: 'student1@test.com',
            password: 'password123',
            role: 'student'
        });

        console.log('Adding Students Profiles...');
        const students = await Student.insertMany([
            { name: 'Alice Johnson', email: 'student1@test.com', rollNumber: '101', batch: '2024-A', assignedTeacher: teacherUser._id },
            { name: 'Bob Smith', email: 'bob@test.com', rollNumber: '102', batch: '2024-A', assignedTeacher: teacherUser._id },
            { name: 'Charlie Brown', email: 'charlie@test.com', rollNumber: '103', batch: '2024-A', assignedTeacher: teacherUser._id },
            { name: 'Diana Prince', email: 'diana@test.com', rollNumber: '104', batch: '2024-A', assignedTeacher: teacherUser._id },
            { name: 'Evan Wright', email: 'evan@test.com', rollNumber: '105', batch: '2024-A', assignedTeacher: teacherUser._id },
        ]);

        console.log('Adding Subject...');
        const math = await Subject.create({
            name: 'Mathematics',
            code: 'MATH101',
            teacher: teacherUser._id, // Link to Teacher User
        });

        console.log('Adding Attendance Records...');
        // Create 20 days of data
        const records = [];

        // Helper to generate random status
        const getStatus = () => {
            const rand = Math.random();
            if (rand > 0.85) return 'Absent';
            if (rand > 0.70) return 'Late';
            return 'Present';
        };

        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i); // Go back i days

            const dailyRecord = students.map(student => ({
                student: student._id,
                status: getStatus()
            }));

            records.push({
                date: date,
                subject: math._id,
                records: dailyRecord
            });
        }

        await Attendance.insertMany(records);

        console.log('✅ Database Seeded Successfully!');

        console.log('\n--- LOGIN CREDENTIALS ---');
        console.log('Admin:   admin@example.com / password123');
        console.log('Teacher: teacher1@test.com / password123');
        console.log('Student: student1@test.com / password123');
        console.log('-------------------------\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
