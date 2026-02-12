import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const ClassReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Ensure backend is running!
                const response = await api.get('/analytics/class-report');
                setReport(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch report:", err);
                setError('Failed to load data. Is the backend server running?');
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    if (!report || report.totalStudents === 0) {
        return <div className="text-center p-10">No records found. Start by marking attendance!</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Class Attendance Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Total Classes</h3>
                    <p className="text-3xl font-bold">{report.totalClasses}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-gray-500 text-sm">Total Students</h3>
                    <p className="text-3xl font-bold">{report.totalStudents}</p>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm">At Risk Students</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {report.atRiskStudents.length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600">Name</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600">Roll No</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600">Classes Attended</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600">Percentage</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {report.fullReport.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">{student.name}</td>
                                <td className="py-3 px-4">{student.rollNumber}</td>
                                <td className="py-3 px-4">
                                    {student.presentClasses} / {student.totalClasses}
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`font-bold ${student.isLowAttendance ? 'text-red-500' : 'text-green-600'}`}>
                                        {student.percentage}%
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {student.isLowAttendance ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">At Risk</span>
                                    ) : (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Good</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClassReport;
