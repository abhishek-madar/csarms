const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Academic = require('../models/Academic');
const User = require('../models/User');
const Course = require('../models/Course');

const checkAcademics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await Academic.find({}).populate('studentRef', 'name').populate('courseRef', 'courseName');
    console.log(JSON.stringify(records, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAcademics();
