const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Faculty'));

router.get('/assigned-courses', getAssignedCourses);
router.post('/create-course', createCourse);
router.get('/course-students/:courseId', getCourseStudents);
router.get('/department-students', getDepartmentStudents);
router.post('/enroll-existing', enrollExistingStudent);
router.post('/add-student', addStudentToCourse);
router.post('/update-marks', updateMarks);
router.get('/attendance/:courseId', getAttendanceSessions);
router.post('/attendance', saveAttendance);
router.delete('/course/:courseId', deleteCourse);

module.exports = router;
