const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Get overall class analytics (low attendance, percentages)
// @route   GET /api/analytics/class-report
// @access  Public
const getClassAnalytics = async (req, res) => {
    try {
        // 1. Fetch all attendance records
        const allAttendance = await Attendance.find().populate('records.student');

        if (!allAttendance.length) {
            return res.status(200).json({ globalPercentage: 0, atRiskStudents: [] });
        }

        // 2. Initialize counters for each student
        // Map: StudentID -> { total: 0, present: 0, name: "", ... }
        const studentStats = {};
        let totalClassesRecorded = allAttendance.length;

        allAttendance.forEach(day => {
            day.records.forEach(record => {
                const studentId = record.student._id.toString();

                if (!studentStats[studentId]) {
                    studentStats[studentId] = {
                        id: studentId,
                        name: record.student.name,
                        rollNumber: record.student.rollNumber,
                        totalClasses: 0,
                        presentClasses: 0
                    };
                }

                studentStats[studentId].totalClasses++;

                // Count 'Present' or 'Late' as present/attended
                if (record.status === 'Present' || record.status === 'Late') {
                    studentStats[studentId].presentClasses++;
                }
            });
        });

        // 3. Calculate percentages and identify at-risk students
        const atRiskThreshold = 75;
        const studentReport = Object.values(studentStats).map(student => {
            const percentage = (student.presentClasses / student.totalClasses) * 100;
            return {
                ...student,
                percentage: parseFloat(percentage.toFixed(2)),
                isLowAttendance: percentage < atRiskThreshold
            };
        });

        // 4. Filter for low attendance
        const atRiskStudents = studentReport.filter(s => s.isLowAttendance);

        // PRIVACY Check: If student, mask individual data
        if (req.user && req.user.role === 'student') {
            res.json({
                totalClasses: totalClassesRecorded,
                totalStudents: Object.keys(studentStats).length,
                atRiskStudents: [], // Hidden
                fullReport: studentReport.map(s => ({ ...s, name: 'Hidden', rollNumber: '***' })) // Sanitized needed for calculations in Frontend? 
                // Dashboard.jsx uses fullReport to calculate overall P/A pie chart. 
                // So we need the counts, but names are not needed.
            });
        } else {
            res.json({
                totalClasses: totalClassesRecorded,
                totalStudents: Object.keys(studentStats).length,
                atRiskStudents,
                fullReport: studentReport
            });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly attendance summary
// @route   GET /api/analytics/monthly
// @access  Public
const getMonthlySummary = async (req, res) => {
    try {
        const allAttendance = await Attendance.find();

        // Object to store stats per month: { "2023-10": { total: 10, averageAttendance: 85 } }
        const monthlyStats = {};

        allAttendance.forEach(record => {
            // Extract YYYY-MM from the date
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    totalClasses: 0,
                    totalPresent: 0,
                    totalRecords: 0
                };
            }

            monthlyStats[monthKey].totalClasses++;

            // Calculate present count for this specific class/day
            const presentCount = record.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
            const totalStudents = record.records.length;

            monthlyStats[monthKey].totalPresent += presentCount;
            monthlyStats[monthKey].totalRecords += totalStudents;
        });

        // Convert to array and calculate average % per month
        const summary = Object.keys(monthlyStats).map(key => {
            const stats = monthlyStats[key];
            const avgPercentage = stats.totalRecords > 0
                ? (stats.totalPresent / stats.totalRecords) * 100
                : 0;

            return {
                month: key,
                totalClasses: stats.totalClasses,
                averageAttendance: parseFloat(avgPercentage.toFixed(2))
            };
        }).sort((a, b) => a.month.localeCompare(b.month)); // Sort by date

        res.json(summary);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics by subject
// @route   GET /api/analytics/subjects
// @access  Public
const getSubjectAnalytics = async (req, res) => {
    try {
        const allAttendance = await Attendance.find().populate('subject');

        const subjectStats = {};

        allAttendance.forEach(record => {
            if (!record.subject) return; // Skip if subject deleted

            const subjectName = record.subject.name;

            if (!subjectStats[subjectName]) {
                subjectStats[subjectName] = {
                    totalClasses: 0,
                    totalPresent: 0,
                    totalRecords: 0
                };
            }

            subjectStats[subjectName].totalClasses++;

            const presentCount = record.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
            const totalStudents = record.records.length;

            subjectStats[subjectName].totalPresent += presentCount;
            subjectStats[subjectName].totalRecords += totalStudents;
        });

        const summary = Object.keys(subjectStats).map(name => {
            const stats = subjectStats[name];
            const avg = stats.totalRecords > 0
                ? (stats.totalPresent / stats.totalRecords) * 100
                : 0;

            return {
                subject: name,
                attendance: parseFloat(avg.toFixed(2))
            };
        });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in student's stats
// @route   GET /api/analytics/student/me
// @access  Private (Student)
const getMyStats = async (req, res) => {
    try {
        // 1. Find the Student record using the logged-in User's email
        // 1. Find the Student record using the logged-in User's ID (Robust) or Email (Legacy Fallback)
        let student = await Student.findOne({ user: req.user._id }).populate('assignedTeacher', 'name email');

        if (!student) {
            // Fallback: Try finding by email (in case not yet linked by ID)
            student = await Student.findOne({ email: req.user.email }).populate('assignedTeacher', 'name email');
        }

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found linked to this account' });
        }

        // Fetch attendance records for this student
        const attendances = await Attendance.find({
            'records.student': student._id
        }).populate('subject', 'name');

        let totalClasses = 0;
        let presentClasses = 0;
        const subjectStats = {};
        const monthlyStats = {};

        // Flatten history for client-side filtering
        const attendanceHistory = [];
        attendances.forEach(att => {
            const myRecord = att.records.find(r => r.student.toString() === student._id.toString());
            if (myRecord) {
                totalClasses++;
                const isPresent = myRecord.status === 'Present' || myRecord.status === 'Late';
                if (isPresent) presentClasses++;

                // Subject Stats
                const subjectName = att.subject ? att.subject.name : 'Unknown';
                if (!subjectStats[subjectName]) subjectStats[subjectName] = { total: 0, present: 0 };
                subjectStats[subjectName].total++;
                if (isPresent) subjectStats[subjectName].present++;

                // Monthly Stats
                const date = new Date(att.date);
                const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                if (!monthlyStats[month]) monthlyStats[month] = { total: 0, present: 0 };
                monthlyStats[month].total++;
                if (isPresent) monthlyStats[month].present++;

                attendanceHistory.push({
                    date: att.date,
                    subject: subjectName,
                    status: myRecord.status,
                    topic: att.topic || '-'
                });
            }
        });

        // Format subject data
        const subjectData = Object.keys(subjectStats).map(subject => ({
            subject,
            attendance: ((subjectStats[subject].present / subjectStats[subject].total) * 100).toFixed(2)
        }));

        // Format monthly data
        const monthlyData = Object.keys(monthlyStats).map(month => ({
            month,
            attendance: ((monthlyStats[month].present / monthlyStats[month].total) * 100).toFixed(2)
        }));

        res.json({
            studentName: student.name,
            rollNumber: student.rollNumber,
            assignedTeacher: student.assignedTeacher ? { name: student.assignedTeacher.name, email: student.assignedTeacher.email } : null,
            overallAttendance: totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0,
            totalClasses,
            presentClasses,
            subjectData,
            monthlyData,
            attendanceHistory // New field for client-side processing
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    getClassAnalytics,
    getMonthlySummary,
    getSubjectAnalytics,
    getMyStats
};
