import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Users, BookOpen, GraduationCap, Plus, Trash2, Search, Settings, Filter, X, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState('users'); // users | students | subjects
    const [message, setMessage] = useState('');

    // Enhanced UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Data State
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Forms State
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'teacher' });
    const [newStudent, setNewStudent] = useState({ name: '', rollNumber: '', batch: '', email: '', assignedTeacher: '' });
    const [newSubject, setNewSubject] = useState({ name: '', code: '', teacher: '' });

    useEffect(() => {
        fetchUsers();
        fetchStudents();
        fetchSubjects();
    }, []);

    // Derived state for Teachers dropdown
    useEffect(() => {
        if (users) {
            setTeachers(users.filter(u => u.role === 'teacher'));
        }
    }, [users]);

    // --- Filter Logic ---
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // --- API Calls ---
    const fetchUsers = async () => {
        try { const { data } = await api.get('/users'); setUsers(data); }
        catch (e) { console.error("Failed to fetch users"); }
    };
    const fetchStudents = async () => {
        try { const { data } = await api.get('/students'); setStudents(data); }
        catch (e) { console.error("Failed to fetch students"); }
    };
    const fetchSubjects = async () => {
        try { const { data } = await api.get('/subjects'); setSubjects(data); }
        catch (e) { console.error("Failed to fetch subjects"); }
    };

    // --- Handlers ---
    const handleStatusToggle = async (id, currentStatus) => {
        try {
            const { data } = await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
            setUsers(users.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
            showMessage(`User ${data.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            showMessage('Error updating status', true);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/add', newUser);
            showMessage('User created successfully!');
            setNewUser({ name: '', email: '', password: '', role: 'teacher' });
            fetchUsers();
        } catch (error) { showMessage('Error creating user', true); }
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete._id}`);
            showMessage('User deleted successfully');
            fetchUsers();
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (e) { showMessage('Error deleting user', true); }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/students', newStudent);
            showMessage('Student Profile Created!');
            setNewStudent({ name: '', rollNumber: '', batch: '', email: '', assignedTeacher: '' });
            fetchStudents();
        } catch (e) { showMessage('Error creating student', true); }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subjects', newSubject);
            showMessage('Subject Created!');
            setNewSubject({ name: '', code: '', teacher: '' });
            fetchSubjects();
        } catch (e) { showMessage(e.response?.data?.message || 'Error creating subject', true); }
    };

    const showMessage = (msg, isError = false) => {
        setMessage({ text: msg, type: isError ? 'error' : 'success' });
        setTimeout(() => setMessage(''), 3000);
    };

    // --- Render Helpers ---
    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === id
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
                <p className="text-gray-500">System configuration and user management</p>
            </div>

            {/* Notification Toast */}
            {message && (
                <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 animate-fade-in ${message.type === 'error' ? 'bg-red-500' : 'bg-green-600'}`}>
                    {message.text}
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="bg-white rounded-t-xl border-b border-gray-200 flex overflow-x-auto">
                <TabButton id="users" label="User Accounts" icon={Users} />
                <TabButton id="students" label="Student Profiles" icon={GraduationCap} />
                <TabButton id="subjects" label="Subjects" icon={BookOpen} />
            </div>

            <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 p-6">

                {/* --- USERS TAB --- */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* User List with Filters */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Controls */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
                                <div className="relative w-full md:w-64">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        className="w-full md:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                        value={roleFilter}
                                        onChange={e => setRoleFilter(e.target.value)}
                                    >
                                        <option value="All">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-lg font-bold text-gray-800">All Users</h3>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{filteredUsers.length} Users Found</span>
                            </div>

                            <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-5 py-3 border-b">User Details</th>
                                            <th className="px-5 py-3 border-b">Role</th>
                                            <th className="px-5 py-3 border-b text-center">Status</th>
                                            <th className="px-5 py-3 border-b text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(u => (
                                                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
                                                    <td className="px-5 py-3">
                                                        <div className="font-medium text-gray-900">{u.name}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize border
                                                            ${u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                                u.role === 'teacher' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    'bg-green-50 text-green-700 border-green-100'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3 text-center">
                                                        <button
                                                            onClick={() => handleStatusToggle(u._id, u.isActive)}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${u.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                                                        >
                                                            <span className={`${u.isActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                                        </button>
                                                        <div className="text-[10px] text-gray-400 font-medium mt-1">
                                                            {u.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        {user.role === 'admin' && u._id !== user._id && (
                                                            <button
                                                                onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }}
                                                                className="text-gray-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 bg-white">
                                                    <div className="flex flex-col items-center">
                                                        <Search className="w-8 h-8 mb-2 opacity-20" />
                                                        <p>No users found matching your search.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Create User Form */}
                        <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Create Account
                            </h3>
                            <form onSubmit={handleCreateUser} className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                                    <input type="email" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Password</label>
                                    <input type="password" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                                    <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-medium py-2 rounded shadow hover:bg-indigo-700 transition mt-2">
                                    Create User
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- STUDENTS TAB --- */}
                {activeTab === 'students' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Student Profiles</h3>
                            </div>
                            <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Details</th>
                                            <th className="px-4 py-3">Batch</th>
                                            <th className="px-4 py-3">Assigned Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map(s => (
                                            <tr key={s._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{s.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{s.rollNumber}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{s.batch}</td>
                                                <td className="px-4 py-3">
                                                    {s.assignedTeacher ? (
                                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                                                            {s.assignedTeacher.name}
                                                        </span>
                                                    ) : <span className="text-xs text-gray-400">Unassigned</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Student Profile
                            </h3>
                            <form onSubmit={handleCreateStudent} className="space-y-3">
                                <input type="text" placeholder="Full Name" className="w-full p-2 border rounded text-sm" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required />
                                <input type="text" placeholder="Roll Number" className="w-full p-2 border rounded text-sm" value={newStudent.rollNumber} onChange={e => setNewStudent({ ...newStudent, rollNumber: e.target.value })} required />
                                <input type="email" placeholder="Email (for Linking)" className="w-full p-2 border rounded text-sm" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required />
                                <input type="text" placeholder="Batch (e.g. 2026)" className="w-full p-2 border rounded text-sm" value={newStudent.batch} onChange={e => setNewStudent({ ...newStudent, batch: e.target.value })} required />
                                <select className="w-full p-2 border rounded text-sm" value={newStudent.assignedTeacher} onChange={e => setNewStudent({ ...newStudent, assignedTeacher: e.target.value })} required>
                                    <option value="">-- Assign Teacher --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                                <button type="submit" className="w-full bg-green-600 text-white font-medium py-2 rounded shadow hover:bg-green-700 transition">
                                    Save Profile
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- SUBJECTS TAB --- */}
                {activeTab === 'subjects' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Course Subjects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subjects.map(sub => (
                                    <div key={sub._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{sub.name}</h4>
                                                <p className="text-xs text-gray-500 font-mono mt-1">{sub.code}</p>
                                            </div>
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Instructor</span>
                                            <span className="text-xs font-medium text-gray-900">{sub.teacher?.name || 'Pending'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Subject
                            </h3>
                            <form onSubmit={handleCreateSubject} className="space-y-3">
                                <input type="text" placeholder="Subject Name" className="w-full p-2 border rounded text-sm" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required />
                                <input type="text" placeholder="Course Code" className="w-full p-2 border rounded text-sm" value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} required />
                                <select className="w-full p-2 border rounded text-sm" value={newSubject.teacher} onChange={e => setNewSubject({ ...newSubject, teacher: e.target.value })} required>
                                    <option value="">-- Assign Instructor --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded shadow hover:bg-blue-700 transition">
                                    Add Subject
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-900">{userToDelete?.name}</span>?
                                <br />This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;
