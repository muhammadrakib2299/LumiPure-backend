import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const createAdminUser = async () => {
    try {
        console.log('🔧 Creating admin user...\n');

        await connectDB();

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@lumipure.com' });

        if (adminExists) {
            console.log('✅ Admin user already exists!');
            console.log(`📧 Email: ${adminExists.email}`);
            console.log(`👤 Name: ${adminExists.name}`);
            console.log(`🔑 Role: ${adminExists.role}`);
            console.log('\n💡 You can login at: http://localhost:3000/admin/login');
            console.log('📝 Password: admin123\n');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@lumipure.com',
            password: 'admin123',  // Will be hashed automatically by User model
            role: 'admin',
            isEmailVerified: true,
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📋 Admin Credentials:');
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Password: admin123`);
        console.log(`   👤 Name: ${admin.name}`);
        console.log(`   🛡️  Role: ${admin.role}\n`);
        console.log('🚀 Next Steps:');
        console.log('   1. Visit: http://localhost:3000/admin/login');
        console.log('   2. Login with the credentials above');
        console.log('   3. Start managing your store!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
