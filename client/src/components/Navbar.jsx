import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, Bell, Info, AlertTriangle, CalendarCheck } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
    const { user } = useContext(AuthContext);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dummy notifications based on role
    const getNotifications = () => {
        if (!user) return [];
        if (user.role === 'student') return [
            { id: 1, title: 'Attendance Alert', message: 'Your attendance in Mathematics is nearing 75%.', time: '1h ago', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
            { id: 2, title: 'Attendance Marked', message: 'Physics attendance marked as Present.', time: '3h ago', icon: CalendarCheck, color: 'text-green-500', bg: 'bg-green-50' }
        ];
        if (user.role === 'teacher') return [
            { id: 1, title: 'Pending Action', message: 'You have not marked attendance for Physics Section A today.', time: '2h ago', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { id: 2, title: 'System Warning', message: 'Tomorrow is a scheduled holiday.', time: '1d ago', icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' }
        ];
        return [
            { id: 1, title: 'System Update', message: 'Analytics module updated to latest version.', time: '12m ago', icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            { id: 2, title: 'Database Backup', message: 'Nightly backup completed successfully.', time: '4h ago', icon: CalendarCheck, color: 'text-green-500', bg: 'bg-green-50' }
        ];
    };

    const notifications = getNotifications();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
                    Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform origin-top-right transition-all">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                    {notifications.length} new
                                </span>
                            </div>
                            <div className="max-h-[320px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 group">
                                                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
                                                    <notif.icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2 font-medium">
                                                        {notif.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-50 text-center">
                                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {user?.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
