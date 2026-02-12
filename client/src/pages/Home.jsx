import React from 'react';

const Home = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">
                    Attendance Analyzer
                </h1>
                <p className="text-gray-600 text-lg">
                    Frontend Setup Complete with Tailwind CSS! 🚀
                </p>
                <div className="mt-6 space-x-4">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                        Dashboard
                    </button>
                    <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition">
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
