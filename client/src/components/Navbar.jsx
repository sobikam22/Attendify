import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, Bell } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>
                {/* Breadcrumbs or Title could go here */}
                <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
                    Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
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
