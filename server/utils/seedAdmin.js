const User = require('../models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = 'sobika@admin.com';
        const defaultPassword = 'sobika123';
        
        let admin = await User.findOne({ email: adminEmail });
        
        if (!admin) {
            await User.create({
                name: 'Admin Sobika',
                email: adminEmail,
                password: defaultPassword,
                role: 'admin'
            });
            console.log(`[SEED] Created default admin user: ${adminEmail}`);
        } else {
            // Force reset password to ensure it's always 'sobika123'
            admin.password = defaultPassword;
            admin.role = 'admin';
            await admin.save();
            console.log(`[SEED] Ensured default admin user password and role for: ${adminEmail}`);
        }
    } catch (error) {
        console.error('[SEED] Error seeding admin user:', error.message);
    }
};

module.exports = seedAdmin;
