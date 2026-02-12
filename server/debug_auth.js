const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs'); // Import bcrypt directly to test

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        const email = 'admin@example.com';
        const password = 'password123';

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found!');
            process.exit();
        }
        console.log('✅ User found:', user.name);
        console.log('   Stored Hash:', user.password);

        // 2. Test Model Method
        const isMatchModel = await user.matchPassword(password);
        console.log(`Test 1 (Model Method): Password Match? ${isMatchModel ? '✅ YES' : '❌ NO'}`);

        // 3. Test Direct Compare
        const isMatchDirect = await bcrypt.compare(password, user.password);
        console.log(`Test 2 (Direct Bcrypt): Password Match? ${isMatchDirect ? '✅ YES' : '❌ NO'}`);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testLogin();
