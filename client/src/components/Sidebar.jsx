import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    FileText,
    Settings,
    LogOut,
    GraduationCap,
    ClipboardCheck
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    const roleLinks = {
        student: [
            { to: "/student", icon: LayoutDashboard, label: "Dashboard" },
            { to: "/student/history", icon: FileText, label: "Attendance History" },
            // Students can view teacher dashboard in read-only mode
            { to: "/teacher", icon: Users, label: "Class View" }
        ],
        teacher: [
            { to: "/teacher", icon: LayoutDashboard, label: "Dashboard" },
            { to: "/teacher/classes", icon: BookOpen, label: "My Classes" },
            { to: "/teacher/students", icon: Users, label: "Students" },
        ],
        admin: [
            { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
            { to: "/admin/users", icon: Users, label: "User Management" },
            { to: "/admin/subjects", icon: BookOpen, label: "Subjects" },
            { to: "/admin/settings", icon: Settings, label: "Settings" },
        ]
    };

    const links = roleLinks[user?.role] || [];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col hidden md:flex z-50">
            <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">Attendify</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Menu
                </div>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to !== "/student/history" && link.to !== "/teacher/classes"} // Exact match for dashboard
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
                <div className="mt-4 px-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
