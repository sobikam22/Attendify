import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { Users, BookOpen, Calendar, CheckSquare, PlusCircle, AlertCircle } from 'lucide-react';

const TeacherDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [view, setView] = useState('dashboard');
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

    const isStudent = user?.role === 'student';

    useEffect(() => {
        if (user?.role === 'student') {
            setView('dashboard');
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
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setView('attendance')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'attendance' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Mark Attendance
                        </button>
                        <button
                            onClick={() => setView('students')}
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
            {view === 'students' && !isStudent && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-indigo-600" />
                        Add New Student
                    </h2>
                    <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 border-b border-gray-100 pb-8">
                        <input type="text" placeholder="Full Name" required className="border p-2 rounded" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                        <input type="text" placeholder="Roll Number" required className="border p-2 rounded" value={newStudent.rollNumber} onChange={e => setNewStudent({ ...newStudent, rollNumber: e.target.value })} />
                        <input type="email" placeholder="Email (Linked to User)" required className="border p-2 rounded" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
                        <input type="text" placeholder="Batch" required className="border p-2 rounded" value={newStudent.batch} onChange={e => setNewStudent({ ...newStudent, batch: e.target.value })} />
                        <input type="text" placeholder="Contact Info" className="border p-2 rounded" value={newStudent.contact} onChange={e => setNewStudent({ ...newStudent, contact: e.target.value })} />
                        <button type="submit" className="md:col-span-2 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition">Add Student</button>
                    </form>

                    <h3 className="text-lg font-bold text-gray-800 mb-4">Class List</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-2">Roll No</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Batch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => (
                                    <tr key={s._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-2 border-b">{s.rollNumber}</td>
                                        <td className="px-4 py-2 border-b font-medium">{s.name}</td>
                                        <td className="px-4 py-2 border-b text-gray-500">{s.email}</td>
                                        <td className="px-4 py-2 border-b text-gray-500">{s.batch}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TeacherDashboard;
