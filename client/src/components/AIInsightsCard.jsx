import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../api/axios';

const AIInsightsCard = ({ stats, students }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post('/ai/analyze-attendance', { stats, students });
            setInsights(data.insights);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate insights. Ensure your API key is configured.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full -z-10 blur-xl"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-sm border border-indigo-200">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900">Google Gemini AI Insights</h3>
                        <p className="text-xs text-indigo-700">Intelligent Attendance Analyzer</p>
                    </div>
                </div>
                {!insights && !loading && (
                    <button
                        onClick={generateInsights}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95"
                    >
                        <Sparkles className="w-4 h-4" />
                        Generate AI Analysis
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-800 animate-pulse">
                        Gemini AI is analyzing class data...
                    </span>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium">
                    {error}
                </div>
            ) : insights ? (
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-indigo-50 shadow-sm">
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {insights}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-indigo-700 bg-white/40 p-4 rounded-xl border border-indigo-50">
                    Click the button above to let Google Gemini analyze your students' attendance performance, identify at-risk students, and provide actionable recommendations.
                </p>
            )}
        </div>
    );
};

export default AIInsightsCard;
