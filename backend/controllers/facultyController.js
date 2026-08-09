const Course = require('../models/Course');
const Academic = require('../models/Academic');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');

const getAssignedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ assignedFacultyRef: req.user.id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCourse = async (req, res) => {
  const { courseName, courseCode } = req.body;
  try {
    const course = await Course.create({
      courseName,
      courseCode,
      assignedFacultyRef: req.user.id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;
    
    const query = { courseRef: courseId };
    if (semester && !isNaN(Number(semester))) {
      query.semester = Number(semester);
    } else {
      // If no semester provided or invalid, default to 1 for security
      query.semester = 1;
    }
    console.log('Fetching students with query:', query);

    const records = await Academic.find(query)
      .populate('studentRef', 'name usnOrEmpId email');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/faculty/department-students — Get all students under the same HOD scope
const getDepartmentStudents = async (req, res) => {
  try {
    // Find the current faculty's hodRef
    const faculty = await User.findById(req.user.id);
    if (!faculty || !faculty.hodRef) {
      return res.json([]); // No HOD linked, return empty
    }

    // Find all students under this HOD
    const students = await User.find({ 
      role: 'Student', 
      hodRef: faculty.hodRef 
    }).select('name email usnOrEmpId _id');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/faculty/enroll-existing — Enroll an existing student into a course (quick-add via + button)
const enrollExistingStudent = async (req, res) => {
  const { studentId, courseId, semester } = req.body;
  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already enrolled in this course FOR THIS SEMESTER
    const recordExists = await Academic.findOne({ 
      studentRef: studentId, 
      courseRef: courseId,
      semester: Number(semester) || 1
    });
    
    if (recordExists) {
      return res.status(400).json({ message: 'Student already enrolled in this course for this semester' });
    }

    const record = await Academic.create({
      studentRef: studentId,
      courseRef: courseId,
      semester: Number(semester) || 1,
      marks: 0,
      attendance: 0
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/faculty/add-student — Add a brand new student and enroll in course
const addStudentToCourse = async (req, res) => {
  const { name, email, password, usnOrEmpId, courseId, semester } = req.body;
  try {
    let student = await User.findOne({ email });
    
    // If student doesn't exist, create them
    if (!student) {
      // Look up the faculty's hodRef and department to assign to the new student
      const faculty = await User.findById(req.user.id);
      const hodRef = faculty ? faculty.hodRef : null;
      const department = faculty ? faculty.department : 'General';

      // Hash password explicitly
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      student = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'Student',
        usnOrEmpId,
        hodRef,
        department  // Student inherits department from their faculty
      });
    }

    // Check if record already exists
    const recordExists = await Academic.findOne({ 
      studentRef: student._id, 
      courseRef: courseId,
      semester: Number(semester) || 1
    });
    
    if (recordExists) {
      return res.status(400).json({ message: 'Student already added to this course for this semester' });
    }

    const record = await Academic.create({
      studentRef: student._id,
      courseRef: courseId,
      semester: Number(semester) || 1,
      marks: 0,
      attendance: 0
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMarks = async (req, res) => {
  try {
    const { recordId, marks, totalMarks, attendance } = req.body;
    
    const record = await Academic.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.marks = marks ?? record.marks;
    record.totalMarks = totalMarks ?? record.totalMarks;
    record.attendance = attendance ?? record.attendance;
    
    const updatedRecord = await record.save();

    // Trigger Notification
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Notification.create({
      title: 'Academic Record Updated',
      message: `Your marks/attendance for a course have been updated.`,
      type: 'AcademicAlert',
      senderRef: req.user.id,
      recipientRole: 'Student',
      targetUserId: record.studentRef,
      expiresAt
    });

    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/faculty/attendance/:courseId — Get all attendance sessions for a course and semester
const getAttendanceSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;
    
    const query = { courseRef: courseId };
    if (semester) {
      query.semester = Number(semester);
    }

    const sessions = await Attendance.find(query).sort({ date: -1, slot: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/faculty/attendance — Save or update an attendance session
const saveAttendance = async (req, res) => {
  try {
    const { courseId, date, slot, records, semester } = req.body;
    
    // Convert date string to start of day
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(0, 0, 0, 0);

    let session = await Attendance.findOne({ 
      courseRef: courseId, 
      date: sessionDate, 
      slot,
      semester: Number(semester) || 1
    });

    if (session) {
      // Update existing session
      session.records = records;
      await session.save();
    } else {
      // Create new session
      session = await Attendance.create({
        courseRef: courseId,
        date: sessionDate,
        slot,
        semester: Number(semester) || 1,
        records
      });
    }

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    console.log(`Attempting to delete course ${courseId} for faculty ${userId}`);
    
    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the current faculty is the owner
    // Compare string IDs to be safe
    if (course.assignedFacultyRef.toString() !== userId.toString()) {
      console.log(`Unauthorized delete attempt: Course owned by ${course.assignedFacultyRef}, attempted by ${userId}`);
      return res.status(403).json({ message: 'You are not authorized to delete this course' });
    }

    // Delete associated data
    const academicResult = await Academic.deleteMany({ courseRef: courseId });
    const attendanceResult = await Attendance.deleteMany({ courseRef: courseId });
    await Course.findByIdAndDelete(courseId);

    console.log(`Successfully deleted course ${courseId}. Removed ${academicResult.deletedCount} academic records and ${attendanceResult.deletedCount} attendance records.`);

    res.json({ message: 'Course and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAssignedCourses, 
  createCourse, 
  getCourseStudents, 
  getDepartmentStudents,
  enrollExistingStudent,
  addStudentToCourse, 
  updateMarks,
  getAttendanceSessions,
  saveAttendance,
  deleteCourse
};
