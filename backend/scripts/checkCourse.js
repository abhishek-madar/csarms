const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const Course = require('../models/Course');

const checkCourse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courses = await Course.find({});
    console.log(JSON.stringify(courses, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkCourse();
