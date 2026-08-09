const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ usnOrEmpId: 'ADMIN001' });
    if (user) {
      console.log('User found with ADMIN001:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('No user found with ADMIN001');
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

findAdmin();
