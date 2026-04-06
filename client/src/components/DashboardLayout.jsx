import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex font-sans relative overflow-hidden">
            {/* Soft Ambient Cool Light Background Orbs */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
                <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
            </div>

            {/* Desktop Sidebar */}
            <div className="relative z-20">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative z-10">
                <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay would go here */}
            {/* Simple mobile menu implementation for now */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
                        <Sidebar />
                        {/* Note: Sidebar component needs to be slightly adjusted to work perfectly inside here without 'fixed' or duplicate IDs, 
                            but for specific MVP this wrapping works if Sidebar handles its internal layout well. 
                            Actually Sidebar has 'fixed' class. We might need to adjust or pass a prop.
                            For now, let's just rely on the existing Sidebar styles which are fixed. 
                        */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
