const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

// GET /api/hod/faculty — Only show faculty under THIS HOD
const getFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'Faculty', hodRef: req.user.id }).select('-password');
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/hod/departments — Get departments created by this HOD
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ hodRef: req.user.id }).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hod/departments — Create a new department
const addDepartment = async (req, res) => {
  const { name } = req.body;
  try {
    const deptExists = await Department.findOne({ name, hodRef: req.user.id });
    if (deptExists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({
      name,
      hodRef: req.user.id
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/hod/departments/:id — Delete a department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, hodRef: req.user.id });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if any faculty are in this department before deleting
    const facultyExists = await User.findOne({ role: 'Faculty', department: department.name, hodRef: req.user.id });
    if (facultyExists) {
      return res.status(400).json({ message: 'Cannot delete department with existing faculty. Move or delete them first.' });
    }

    await department.deleteOne();
    res.json({ message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/hod/faculty — Create faculty linked to THIS HOD with a department
const addFaculty = async (req, res) => {
  const { name, email, password, usnOrEmpId, department } = req.body;
  console.log('[addFaculty] Received department:', department); // DEBUG
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
      role: 'Faculty',
      usnOrEmpId,
      hodRef: req.user.id,
      department: department || null   // null if not provided — never use a wrong default
    });

    console.log('[addFaculty] Saved faculty with department:', user.department); // DEBUG

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/hod/faculty/:id — Only delete faculty under THIS HOD
const deleteFaculty = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Faculty') {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    if (user.hodRef && user.hodRef.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this faculty' });
    }
    await user.deleteOne();
    res.json({ message: 'Faculty removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFaculty, getDepartments, addDepartment, deleteDepartment, addFaculty, deleteFaculty };
