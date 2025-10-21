import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

async function createAdminUser(email, password) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.connection.close();
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user object
    const adminUser = new User({
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      role: 'admin',
      fullName: 'Administrator',
      bio: 'System Administrator'
    });
    
    // Save to database
    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
}

// Get email and password from command line arguments or use defaults
const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

createAdminUser(email, password);