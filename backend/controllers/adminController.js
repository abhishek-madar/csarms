const User = require('../models/User');
const Course = require('../models/Course');
const Academic = require('../models/Academic');
const bcrypt = require('bcryptjs');

const getSystemStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalFaculty = await User.countDocuments({ role: 'Faculty' });
    const totalCourses = await Course.countDocuments();
    const totalRecords = await Academic.countDocuments();

    res.json({
      totalStudents,
      totalFaculty,
      totalCourses,
      totalRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHODs = async (req, res) => {
  try {
    const hods = await User.find({ role: 'HOD' }).select('-password');
    res.json(hods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addHOD = async (req, res) => {
  const { name, email, password, usnOrEmpId, department } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password explicitly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'HOD',
      usnOrEmpId,
      department: department || null
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHOD = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'HOD') {
      return res.status(404).json({ message: 'HOD not found' });
    }
    await user.deleteOne();
    res.json({ message: 'HOD removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSystemStats, getHODs, addHOD, deleteHOD };
