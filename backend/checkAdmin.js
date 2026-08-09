const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@csarms.edu';
    const adminPassword = 'adminpassword123';

    const user = await User.findOne({ email: adminEmail });
    if (!user) {
      console.log('Admin user not found');
      process.exit();
    }

    console.log('User found:', user.email);
    console.log('Stored Hashed Password:', user.password);

    const isMatch = await user.matchPassword(adminPassword);
    console.log('Password Match Result:', isMatch);

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
