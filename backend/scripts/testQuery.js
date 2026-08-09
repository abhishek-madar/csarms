const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Academic = require('../models/Academic');
const User = require('../models/User');
const Course = require('../models/Course');

const testQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courseId = '69ff6e6f0b6ef4da14443808'; // MATHS
    const semester = 6;
    
    const query = { courseRef: courseId, semester: Number(semester) };
    console.log('Query:', query);
    
    const records = await Academic.find(query);
    console.log('Results:', records.length);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testQuery();
