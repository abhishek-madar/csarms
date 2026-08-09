const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d',
  });
};

const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    console.log('Login attempt body:', req.body);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Login failed: User not found (${email})`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Role detection: Use the role from the database instead of forcing the user to pick correctly
    console.log(`Login success: ${email} detected as ${user.role}`);

    console.log(`Login success: ${email}`);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      usnOrEmpId: user.usnOrEmpId,
      profilePicture: user.profilePicture,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, role, usnOrEmpId } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      usnOrEmpId
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.dob = req.body.dob || user.dob;
    if (req.body.profilePicture !== undefined) {
      user.profilePicture = req.body.profilePicture;
    }
    
    // Optionally allow updating email or ID if business logic permits (usually restricted)
    // user.email = req.body.email || user.email;
    // user.usnOrEmpId = req.body.usnOrEmpId || user.usnOrEmpId;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      usnOrEmpId: updatedUser.usnOrEmpId,
      phone: updatedUser.phone,
      dob: updatedUser.dob,
      department: updatedUser.department,
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const targetUser = await User.findById(id).select('-password');
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Restriction: allow students to watch faculties profile only who added them (teaching them)
    if (req.user.role === 'Student') {
      if (targetUser.role === 'Faculty') {
        const Course = require('../models/Course');
        const Academic = require('../models/Academic');
        
        const courses = await Course.find({ assignedFacultyRef: id });
        const courseIds = courses.map(c => c._id);
        
        const isTeaching = await Academic.findOne({
          studentRef: req.user.id,
          courseRef: { $in: courseIds }
        });
        
        if (!isTeaching) {
          return res.status(403).json({ message: 'Access denied: You can only view profiles of faculty who added/teach you.' });
        }
      } else if (targetUser._id.toString() !== req.user.id) {
        // Student can only see their own profile or their specific faculty
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    res.json(targetUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, registerUser, getProfile, updateProfile, getUserProfile };
