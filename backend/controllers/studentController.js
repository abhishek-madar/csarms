const Academic = require('../models/Academic');
const Attendance = require('../models/Attendance');

const getStudentRecords = async (req, res) => {
  try {
    const records = await Academic.find({ studentRef: req.user.id })
      .populate({
        path: 'courseRef',
        select: 'courseName courseCode assignedFacultyRef',
        populate: {
          path: 'assignedFacultyRef',
          select: 'name email profilePicture department usnOrEmpId phone dob'
        }
      })
      .sort({ semester: -1 });

    if (records) {
      res.json(records);
    } else {
      res.status(404).json({ message: 'No records found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/student/attendance/summary
const getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get all courses the student is enrolled in
    const academics = await Academic.find({ studentRef: studentId }).populate({
      path: 'courseRef',
      populate: {
        path: 'assignedFacultyRef',
        select: 'name _id role department profilePicture'
      }
    });
    
    const summary = [];

    for (const record of academics) {
      if (!record.courseRef) continue;
      
      const courseId = record.courseRef._id;
      const semester = record.semester;
      
      // Get all attendance sessions for this course AND semester
      const sessions = await Attendance.find({ courseRef: courseId, semester: semester });
      
      let totalClasses = sessions.length;
      let presentClasses = 0;
      
      for (const session of sessions) {
        const studentRecord = session.records.find(r => r.studentRef.toString() === studentId);
        if (studentRecord && studentRecord.status === 'P') {
          presentClasses++;
        }
      }
      
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
      
      summary.push({
        courseId: courseId,
        courseName: record.courseRef.courseName,
        courseCode: record.courseRef.courseCode,
        faculty: record.courseRef.assignedFacultyRef, // Added faculty details
        semester: semester,
        total: totalClasses,
        present: presentClasses,
        percentage: percentage.toFixed(2)
      });
    }
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/student/attendance/detailed
const getDetailedAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get all courses the student is enrolled in
    const academics = await Academic.find({ studentRef: studentId });
    
    // Get all sessions for these courses and specific semesters
    const sessions = [];
    for (const record of academics) {
      const courseSessions = await Attendance.find({ 
        courseRef: record.courseRef, 
        semester: record.semester 
      }).sort({ date: -1, slot: 1 });
      
      courseSessions.forEach(s => {
        const studentRecord = s.records.find(r => r.studentRef.toString() === studentId);
        sessions.push({
          ...s._doc,
          studentRecord
        });
      });
    }

    // Sort combined sessions
    sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
    // Format the response for the grid
    const detailed = [];
    
    for (const session of sessions) {
      const studentRecord = session.studentRecord;
      
      detailed.push({
        courseId: session.courseRef,
        date: session.date,
        slot: session.slot,
        status: studentRecord ? studentRecord.status : 'NA',
        semester: session.semester
      });
    }
    
    res.json(detailed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentRecords, getAttendanceSummary, getDetailedAttendance };
