const test = async () => {
    try {
        console.log('Testing Root Endpoint...');
        const root = await fetch('http://localhost:5000/');
        console.log('✅ Root Status:', root.status);
        const rootText = await root.text();
        console.log('   Response:', rootText);

        console.log('\nTesting Subjects Endpoint...');
        const subjects = await fetch('http://localhost:5000/api/subjects');
        console.log('ℹ️ Subjects Status:', subjects.status);
        const subjectsText = await subjects.text();
        console.log('   Response:', subjectsText.substring(0, 100)); // Print first 100 chars

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
    }
};

test();
