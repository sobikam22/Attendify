import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // We need to set up routing!

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(email, password);
            // Redirect based on role
            if (userData.role === 'admin') navigate('/admin');
            else if (userData.role === 'teacher') navigate('/teacher');
            else navigate('/student');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 left-0"></div>
                
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-[10px] flex items-center justify-center">
                        <div className="text-blue-500 font-bold text-2xl leading-none">A</div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Welcome to Attendify</h2>
                <p className="text-gray-500 text-center mb-8 text-sm">Please sign in to continue</p>

                {error && <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Email address</label>
                        <input
                            type="email"
                            className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 text-sm"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-700 text-sm font-semibold">Password</label>
                            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                        </div>
                        <input
                            type="password"
                            className="w-full p-3 bg-white border border-gray-300 text-gray-900 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-gray-400 text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
