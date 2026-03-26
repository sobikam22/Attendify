const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST /api/ai/analyze-attendance
exports.analyzeAttendance = async (req, res) => {
    try {
        const { stats, students } = req.body;

        // Ensure we have the API key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is not configured in the server environment variables."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Construct a prompt based on the provided data
        const prompt = `
            You are an expert educational data analyst assisting a teacher. 
            Here is the current class attendance summary:
            Total Students: ${stats?.totalStudents || 'N/A'}
            Total Classes: ${stats?.totalClasses || 'N/A'}
            
            Here is the detailed data of students and their attendance percentages:
            ${JSON.stringify(students.map(s => ({ name: s.name, rollNumber: s.rollNumber, attendancePercentage: s.attendancePercentage, status: s.status })), null, 2)}
            
            Based on this data, please provide a concise, 3-paragraph summary:
            1. Identify any students who are severely "At Risk" (below 75%).
            2. Highlight positive trends or students with perfect/high attendance.
            3. Provide 1 or 2 actionable recommendations for the teacher to improve overall class attendance.
            
            Keep the tone professional, encouraging, and clear. Format the response plainly with simple bullet points or paragraphs, avoiding complex markdown that might not render well.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.status(200).json({
            success: true,
            insights: responseText
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate AI insights. Ensure your API key is valid.",
            error: error.message
        });
    }
};
