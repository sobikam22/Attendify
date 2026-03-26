import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { Users, BookOpen, Calendar, CheckSquare, PlusCircle, AlertCircle } from 'lucide-react';
import AIInsightsCard from '../components/AIInsightsCard';

const TeacherDashboard = ({ defaultView = 'dashboard' }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [view, setView] = useState(defaultView);
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Attendance State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [attendanceData, setAttendanceData] = useState({});

    // New Student State
    const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '', batch: '', contact: '', email: '' });

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const isStudent = user?.role === 'student';

    useEffect(() => {
        if (user?.role === 'student') {
            setView('dashboard');
        } else {
            setView(defaultView);
        }
        fetchDashboardData();
        fetchStudents();
        fetchSubjects();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/analytics/class-report');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch class stats");
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/students');
            setStudents(data);
            const initialAttendance = {};
            data.forEach(s => initialAttendance[s._id] = 'Present');
            setAttendanceData(initialAttendance);
        } catch (error) {
            console.error("Failed to fetch students");
        }
    };

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/subjects');
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]._id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        try {
            await api.post('/attendance', {
                date: selectedDate,
                subjectId: selectedSubject,
                topic,
                records: Object.keys(attendanceData).map(studentId => ({
                    student: studentId,
                    status: attendanceData[studentId]
                }))
            });
            alert("Attendance Marked Successfully!");
            setView('dashboard');
            fetchDashboardData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to mark attendance");
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students', { ...newStudent, assignedTeacher: user._id });
            alert("Student Added Successfully");
            setNewStudent({ name: '', rollNumber: '', batch: '', contact: '', email: '' });
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to add student");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Teacher Dashboard
                        {isStudent && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded border border-yellow-300">
                                View Only
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500">Manage your class and students</p>
                </div>

                {!isStudent && (
                    <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                        <button
                            onClick={() => { setView('dashboard'); navigate('/teacher'); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => { setView('classes'); navigate('/teacher/classes'); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'classes' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            My Classes
                        </button>
                        <button
                            onClick={() => { setView('students'); navigate('/teacher/students'); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'students' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Students
                        </button>
                    </div>
                )}
            </div>

            {/* VIEW: DASHBOARD (Overview) */}
            {view === 'dashboard' && stats && (
                <>
                    {!isStudent && <AIInsightsCard stats={stats} students={students} />}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Total Classes</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.totalClasses}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Active Students</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.totalStudents}</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">At Risk (&lt;75%)</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{stats.atRiskStudents?.length || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Class Performance Overview</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.fullReport}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Bar dataKey="percentage" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* VIEW: MY CLASSES */}
            {view === 'classes' && !isStudent && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            My Classes & Subjects
                        </h2>
                        <button
                            onClick={() => { setView('attendance'); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Mark Attendance
                        </button>
                    </div>

                    {subjects.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No classes or subjects assigned yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map(subject => (
                                <div key={subject._id} className="bg-white border text-left border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col items-start justify-start">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:bg-indigo-100 transition-colors"></div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{subject.name}</h3>
                                    <p className="text-sm text-gray-500 font-mono mb-6 pb-4 border-b w-full border-gray-100">{subject.code}</p>

                                    <div className="space-y-3 w-full mt-auto">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Enrolled Students
                                            </span>
                                            <span className="font-semibold text-gray-800">{students.length}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedSubject(subject._id);
                                            setView('attendance');
                                        }}
                                        className="mt-6 w-full px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                        Take Attendance
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW: MARK ATTENDANCE */}
            {view === 'attendance' && !isStudent && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                        Mark Attendance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {subjects.map(sub => (
                                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                            <input
                                type="text"
                                placeholder="E.g., Intro to React Hooks"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden mb-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Roll No</th>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td className="px-4 py-3 font-mono text-gray-600">{student.rollNumber}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                                        <td className="px-4 py-3 flex justify-center gap-2">
                                            {['Present', 'Absent', 'Late'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleAttendanceChange(student._id, status)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${attendanceData[student._id] === status
                                                        ? status === 'Present' ? 'bg-green-600 text-white shadow-sm'
                                                            : status === 'Absent' ? 'bg-red-600 text-white shadow-sm'
                                                                : 'bg-yellow-500 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={submitAttendance}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow transition transform active:scale-95"
                    >
                        Save Attendance Record
                    </button>
                </div>
            )}

            {/* VIEW: MANAGE STUDENTS */}
            {view === 'students' && !isStudent && (() => {
                // Combine student data with stats for percentages
                const studentReportMap = {};
                if (stats && stats.fullReport) {
                    stats.fullReport.forEach(report => {
                        studentReportMap[report.id] = report;
                    });
                }

                const processedStudents = students.map(student => {
                    const report = studentReportMap[student._id];
                    let percentage = 100; // Default if no attendance records yet
                    let status = 'Good';

                    if (report) {
                        percentage = report.percentage;
                        status = report.isLowAttendance ? 'At Risk' : 'Good';
                    }

                    return {
                        ...student,
                        attendancePercentage: percentage,
                        status
                    };
                });

                // Apply Filters
                const filteredStudents = processedStudents.filter(student => {
                    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

                    return matchesSearch && matchesStatus;
                });

                return (
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                My Students
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <input
                                    type="text"
                                    placeholder="Search by name or roll no..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-32 bg-white"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Good">Good</option>
                                    <option value="At Risk">At Risk</option>
                                </select>
                            </div>
                        </div>

                        {filteredStudents.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                                <p className="text-gray-500 text-sm">
                                    {students.length === 0
                                        ? "There are no students assigned to your classes yet."
                                        : "No students match your current search and filter criteria."}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Register No</th>
                                            <th className="px-6 py-4">Class / Batch</th>
                                            <th className="px-6 py-4">Attendance</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStudents.map((s, i) => (
                                            <tr key={s._id} className="bg-white hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{s.name}</div>
                                                    <div className="text-xs text-gray-500">{s.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-gray-600">{s.rollNumber}</td>
                                                <td className="px-6 py-4 text-gray-600">{s.batch}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-semibold ${s.attendancePercentage < 75 ? 'text-red-600' : 'text-indigo-600'}`}>
                                                            {s.attendancePercentage}%
                                                        </span>
                                                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className={`h-full rounded-full ${s.attendancePercentage < 75 ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                                style={{ width: `${s.attendancePercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${s.status === 'Good'
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                        }`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => alert(`View details for ${s.name} (Coming Soon)`)}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })()}
        </DashboardLayout>
    );
};

export default TeacherDashboard;
