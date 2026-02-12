import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [overallStats, setOverallStats] = useState({ present: 0, absent: 0 }); // For pie chart
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Monthly Trend (Line Chart)
                const monthlyRes = await api.get('/analytics/monthly');
                setMonthlyData(monthlyRes.data);

                // 2. Fetch Subject Analytics (Bar Chart)
                const subjectRes = await api.get('/analytics/subjects');
                setSubjectData(subjectRes.data);

                // 3. Fetch Class Report (For Pie Chart)
                const classRes = await api.get('/analytics/class-report');
                if (classRes.data && classRes.data.fullReport) {
                    // Calculate global present vs absent
                    let totalP = 0;
                    let totalA = 0;
                    classRes.data.fullReport.forEach(student => {
                        totalP += student.presentClasses;
                        totalA += (student.totalClasses - student.presentClasses);
                    });
                    setOverallStats({ name: 'Attendance', present: totalP, absent: totalA });
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    const pieData = [
        { name: 'Present', value: overallStats.present },
        { name: 'Absent', value: overallStats.absent },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* 1. Line Chart: Monthly Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Attendance Trend (Monthly)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="averageAttendance" stroke="#8884d8" name="Avg Attendance %" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Data Flow: DB &rarr; Aggregation &rarr; specific month</p>
                </div>

                {/* 2. Bar Chart: Subject-wise Stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Subject Performance</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendance" fill="#82ca9d" name="Attendance %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Pie Chart: Overall Presence */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Overall Ratio</h3>
                    <div className="h-64 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
