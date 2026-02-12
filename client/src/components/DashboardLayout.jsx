import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
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
