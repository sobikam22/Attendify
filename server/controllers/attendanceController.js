const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @desc    Mark attendance for a class
// @route   POST /api/attendance
// @access  Public (for now)
// @desc    Mark attendance (Single or Bulk)
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
const markAttendance = async (req, res) => {
    try {
        const { date, subject, records } = req.body; // records can be array or single object in array

        if (!subject || !records || records.length === 0) {
            return res.status(400).json({ message: 'Subject and records are available' });
        }

        // Normalize date to YYYY-MM-DD to ensure daily uniqueness
        const attendanceDate = new Date(date || Date.now());
        attendanceDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Security: Verify Teacher owns these students
        // If user is Admin, they can mark for anyone. If Teacher, strict check.
        if (req.user.role === 'teacher') {
            for (const record of records) {
                const studentProfile = await Student.findById(record.student);
                if (!studentProfile || studentProfile.assignedTeacher.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        message: `Unauthorized: You can only mark attendance for your assigned students. Student ID: ${record.student}`
                    });
                }
            }
        }

        // Check if an attendance document already exists for this Subject + Date
        let attendance = await Attendance.findOne({
            subject,
            date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (attendance) {
            // Update existing document
            for (const newRecord of records) {
                // Check if student already marked
                const existingIndex = attendance.records.findIndex(
                    r => r.student.toString() === newRecord.student
                );

                if (existingIndex !== -1) {
                    return res.status(400).json({
                        message: `Attendance already marked for student ${newRecord.student} on this date.`
                    });
                }

                attendance.records.push({
                    student: newRecord.student,
                    status: newRecord.status
                });
            }
            await attendance.save();
            res.status(200).json({ message: 'Attendance updated', attendance });
        } else {
            // Create new document
            attendance = new Attendance({
                date: attendanceDate,
                subject,
                records
            });
            await attendance.save();
            res.status(201).json(attendance);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance stats for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Public
const getAttendanceByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Find all attendance records where this student exists
        const attendanceRecords = await Attendance.find({
            "records.student": studentId
        }).populate('subject', 'name code').populate('records.student', 'name rollNumber');

        // Filter out specific status for this student from the class record
        const studentHistory = attendanceRecords.map(record => {
            const studentRecord = record.records.find(r => r.student._id.toString() === studentId);
            return {
                date: record.date,
                subject: record.subject,
                status: studentRecord ? studentRecord.status : 'N/A'
            };
        });

        res.json(studentHistory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history for a specific subject
// @route   GET /api/attendance/subject/:subjectId
// @access  Public
const getSubjectAttendance = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const attendanceRecords = await Attendance.find({ subject: subjectId })
            .sort({ date: -1 }); // Latest first

        res.json(attendanceRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendanceByStudent,
    getSubjectAttendance
};
