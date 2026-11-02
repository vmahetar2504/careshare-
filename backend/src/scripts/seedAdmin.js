import '../config/env.js';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import mongoose from 'mongoose';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@careshare.org').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = (process.env.ADMIN_NAME || 'CareShare Administrator').trim();

    if (!adminPassword) {
      console.warn(
        '⚠️ WARNING: ADMIN_PASSWORD is not set in environment. Falling back to secure default development credential.'
      );
    }

    const passwordToUse = adminPassword || 'Admin@CareShare2024';

    // Split name into first and last
    const nameParts = adminFullName.split(' ');
    const firstName = nameParts[0] || 'CareShare';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      if (existingUser.role !== 'ADMIN' || !existingUser.isActive) {
        existingUser.role = 'ADMIN';
        existingUser.isActive = true;
        existingUser.isEmailVerified = true;
        await existingUser.save();
        console.log(`✓ Existing user (${adminEmail}) has been elevated to ADMIN role.`);
      } else {
        console.log(`✓ Admin user (${adminEmail}) is already provisioned and active.`);
      }
    } else {
      const hashedPassword = await hashPassword(passwordToUse);
      const newAdmin = await User.create({
        firstName,
        lastName,
        email: adminEmail,
        password: hashedPassword,
        phone: '9876543210',
        city: 'Central Office',
        state: 'CareShare HQ',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
      });

      console.log(`✓ New ADMIN account provisioned successfully! ID: ${newAdmin._id} Email: ${adminEmail}`);
    }

    console.log('✓ Admin provisioning completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to provision admin account:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
