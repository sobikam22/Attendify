import React, { useEffect, useState, useContext, useMemo } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { Download, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [rawStats, setRawStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterMonth, setFilterMonth] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchMyStats = async () => {
            try {
                const { data } = await api.get('/analytics/student/me');
                setRawStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch student stats");
                setLoading(false);
            }
        };
        fetchMyStats();
    }, []);

    const processedData = useMemo(() => {
        if (!rawStats) return null;
        let { attendanceHistory = [], subjectData = [], assignedTeacher } = rawStats;

        // Date Filtering
        let filteredHistory = attendanceHistory;
        if (filterMonth !== 'All') {
            filteredHistory = filteredHistory.filter(item => {
                const d = new Date(item.date);
                const m = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                return m === filterMonth;
            });
        }
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            filteredHistory = filteredHistory.filter(item => {
                const d = new Date(item.date);
                return d >= start && d <= end;
            });
        }

        // Recalculate Totals based on filtered history
        const total = filteredHistory.length;
        const present = filteredHistory.filter(i => i.status === 'Present' || i.status === 'Late').length;
        const absent = total - present;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return {
            ...rawStats,
            filteredHistory,
            total,
            present,
            absent,
            percentage,
            subjectData,
            assignedTeacher
        };

    }, [rawStats, filterMonth, dateRange]);

    const downloadReport = () => {
        if (!processedData?.filteredHistory?.length) return alert("No data to download");

        const headers = ['Date', 'Subject', 'Status', 'Topic'];
        const csvContent = [
            headers.join(','),
            ...processedData.filteredHistory.map(row =>
                `${new Date(row.date).toLocaleDateString()},${row.subject},${row.status},${row.topic}`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Attendance_Report_${user.name.replace(/\s+/g, '_')}.csv`;
        link.click();
    };

    if (loading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </DashboardLayout>
    );

    if (!rawStats) return (
        <DashboardLayout>
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                <AlertCircle className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800">No Data Available</h3>
                <p className="text-gray-500 mt-2">Your profile might not be linked properly. Please contact your admin.</p>
                <button onClick={logout} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">Logout</button>
            </div>
        </DashboardLayout>
    );

    const {
        studentName,
        rollNumber,
        assignedTeacher,
        total,
        present,
        absent,
        percentage,
        subjectData,
        monthlyData = [],
        filteredHistory
    } = processedData;

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="text-gray-500">Overview of your attendance and performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Attendance Score */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Overall Attendance</p>
                        <h3 className={`text-3xl font-bold mt-1 ${parseFloat(percentage) < 75 ? 'text-red-500' : 'text-indigo-600'}`}>
                            {percentage}%
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Target: 75%</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                        <CheckCircle className={`w-6 h-6 ${parseFloat(percentage) < 75 ? 'text-red-500' : 'text-indigo-600'}`} />
                    </div>
                </div>

                {/* Total Classes */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Total Classes</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{total}</div>
                </div>

                {/* Present */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Present</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{present}</div>
                </div>

                {/* Absent */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Absent</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{absent}</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Subject Attendance</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <ReferenceLine y={75} stroke="red" strokeDasharray="3 3" label={{ value: '75%', position: 'right', fill: 'red', fontSize: 10 }} />
                                <Bar dataKey="attendance" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Profile Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Name</span>
                                <span className="font-semibold text-gray-900">{studentName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Roll Number</span>
                                <span className="font-medium text-gray-700 font-mono text-sm">{rollNumber}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Teacher</span>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900">{assignedTeacher?.name || 'N/A'}</div>
                                    <div className="text-xs text-gray-400">{assignedTeacher?.email}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</h3>
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${parseFloat(percentage) >= 75 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {parseFloat(percentage) >= 75 ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <div>
                                <p className="font-bold">{parseFloat(percentage) >= 75 ? "Eligible" : "At Risk"}</p>
                                <p className="text-sm mt-1 opacity-90">
                                    {parseFloat(percentage) >= 75
                                        ? "You are eligible for exams."
                                        : "Your attendance is below 75%. Please attend more classes."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Filter Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Attendance History</h3>
                    <div className="flex gap-2">
                        <select
                            className="text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option value="All">All Months</option>
                            {monthlyData.map((m, i) => (
                                <option key={i} value={m.month}>{m.month}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Topic</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">{item.subject}</td>
                                        <td className="px-6 py-3 text-gray-500">{item.topic}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    item.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                        No records found for this selection.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </DashboardLayout>
    );
};

export default StudentDashboard;
