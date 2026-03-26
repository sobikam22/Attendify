require('dotenv').config();
const process = require('process');

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Key length:", key ? key.length : 0);
    console.log("Key starts with:", key ? key.substring(0, 5) : "none");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.error) {
            console.error("API Error Response:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available models:");
            data.models.forEach(m => console.log(" - " + m.name));
        }
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

testGemini();
