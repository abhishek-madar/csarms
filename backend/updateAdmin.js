const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'abhishekbadagi06@gmail.com';
    const adminPassword = 'Abhi@gmail.com';
    const adminName = 'Abhishek Madar (Admin)';

    // Remove old default admin if it exists
    await User.deleteOne({ email: 'admin@csarms.edu' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const updatedAdmin = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: adminName,
        password: hashedPassword,
        role: 'Admin',
        usnOrEmpId: 'ADMIN001'
      },
      { upsert: true, new: true }
    );

    console.log('Admin account updated/created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    process.exit();
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
