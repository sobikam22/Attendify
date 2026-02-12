const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-app');
        console.log('MongoDB Connected');

        const email = 'teacher@leela.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found.');
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = 'password123'; // The pre-save hook will hash this? 
        // Wait, if I set password directly, does the pre-save hook run?
        // Yes, if I use .save() and modify 'password'.

        await user.save();
        console.log(`✅ Password for ${user.name} (${email}) reset to: password123`);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

resetPassword();
