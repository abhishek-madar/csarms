import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Users, Save, X, Plus, UserPlus, Search, Calendar, Trash2 } from 'lucide-react';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({ marks: '', totalMarks: '' });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({ courseName: '', courseCode: '' });
  const [studentFormData, setStudentFormData] = useState({ name: '', email: '', usnOrEmpId: '', password: '' });
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [enrollFormSemester, setEnrollFormSemester] = useState(1);
  
  // Attendance state
  const [activeTab, setActiveTab] = useState('marks'); // 'marks' or 'attendance'
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSlot, setAttendanceSlot] = useState(1);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'P'|'A'|'NA' }

  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, [user.token]);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/faculty/assigned-courses`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/faculty/create-course`, courseFormData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddCourse(false);
      setCourseFormData({ courseName: '', courseCode: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      alert(error.response?.data?.message || 'Failed to add course');
    }
  };

  const fetchStudents = async (courseId, semester = selectedSemester) => {
    console.log(`Fetching students for course ${courseId}, semester ${semester}`);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/faculty/course-students/${courseId}?semester=${semester}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Received students data:', data);
      setStudents(data);
      setSelectedCourse(courseId);
      setEditingRecord(null);
      setEnrolledStudentIds(data.map(r => r.studentRef?._id));
      
      // Initialize attendance records
      const initialAttendance = {};
      data.forEach(r => {
        initialAttendance[r.studentRef._id] = 'P'; // Default to Present
      });
      setAttendanceRecords(initialAttendance);
    } catch (error) {
      console.error('Error fetching students', error);
    }
  };

  const fetchDepartmentStudents = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/faculty/department-students`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDepartmentStudents(data);
    } catch (error) {
      console.error('Error fetching department students', error);
    }
  };

  const openAddStudentPanel = () => {
    fetchDepartmentStudents();
    setShowAddStudent(true);
    setShowNewStudentForm(false);
    setSearchQuery('');
  };

  const handleQuickEnroll = async (studentId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/faculty/enroll-existing`, {
        studentId,
        courseId: selectedCourse,
        semester: enrollFormSemester
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchStudents(selectedCourse, selectedSemester);
      fetchDepartmentStudents();
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert(error.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleAddNewStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/faculty/add-student`, {
        ...studentFormData,
        courseId: selectedCourse,
        semester: enrollFormSemester
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddStudent(false);
      setShowNewStudentForm(false);
      setStudentFormData({ name: '', email: '', usnOrEmpId: '', password: '' });
      fetchStudents(selectedCourse, selectedSemester);
    } catch (error) {
      console.error('Error adding student:', error);
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record._id);
    setEditForm({ marks: record.marks, totalMarks: record.totalMarks || 100 });
  };

  const handleSaveMarks = async (recordId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/faculty/update-marks`, {
        recordId,
        marks: Number(editForm.marks),
        totalMarks: Number(editForm.totalMarks)
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStudents(students.map(s => s._id === recordId ? { ...s, marks: Number(editForm.marks), totalMarks: Number(editForm.totalMarks) } : s));
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating marks', error);
    }
  };

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation(); // Prevent triggering fetchStudents
    if (!window.confirm('Are you sure you want to delete this subject? All associated marks and attendance data will be permanently removed for both you and students.')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/faculty/course/${courseId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (selectedCourse === courseId) setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const recordsToSave = Object.keys(attendanceRecords).map(studentId => ({
        studentRef: studentId,
        status: attendanceRecords[studentId]
      }));

      await axios.post(`${API_BASE_URL}/api/faculty/attendance`, {
        courseId: selectedCourse,
        date: attendanceDate,
        slot: attendanceSlot,
        records: recordsToSave,
        semester: selectedSemester
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.response?.data?.message || 'Failed to save attendance');
    }
  };

  const availableStudents = departmentStudents.filter(s => {
    const notEnrolled = !enrolledStudentIds.includes(s._id);
    const matchesSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.usnOrEmpId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return notEnrolled && matchesSearch;
  });

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-header">
          <div>
            <h1>Faculty Dashboard</h1>
            <p className="subtitle">Manage courses, marks, and daily attendance.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddCourse(true)}>Add Subject</button>
        </div>

        <div className="grid-cards">
          {courses.length > 0 ? courses.map((course) => (
            <div 
              key={course._id} 
              className={`glass-card stack-on-mobile ${selectedCourse === course._id ? 'active-course' : ''}`}
              style={{ 
                cursor: 'pointer', 
                position: 'relative',
                padding: '24px',
                border: selectedCourse === course._id ? '1.5px solid var(--interactive)' : '1px solid var(--border-color)',
                boxShadow: selectedCourse === course._id ? '0 12px 30px rgba(16, 185, 129, 0.15)' : ''
              }}
              onClick={() => fetchStudents(course._id, selectedSemester)}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#1a202c' }}>{course.courseName}</h3>
                <p style={{ color: 'var(--interactive)', fontWeight: 600, fontSize: '0.9rem' }}>{course.courseCode}</p>
              </div>
              <div className="icon-container" style={{ 
                background: 'linear-gradient(135deg, var(--interactive), #34d399)', 
                width: '54px', height: '54px', 
                borderRadius: '16px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', 
                boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.4)',
                flexShrink: 0 
              }}>
                <Users size={26} />
              </div>
            </div>
          )) : (
            <p className="text-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No courses assigned to you.</p>
          )}
        </div>

        {selectedCourse && (
          <div className="glass-card mt-4" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="dashboard-header" style={{ padding: '24px 24px 0 24px', marginBottom: '0' }}>
              <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '12px' }}>
                <button 
                  onClick={() => setActiveTab('marks')}
                  style={{ 
                    background: 'none', border: 'none', padding: '8px 0', fontSize: '1.1rem', cursor: 'pointer',
                    fontWeight: activeTab === 'marks' ? '700' : '500',
                    color: activeTab === 'marks' ? 'var(--interactive)' : '#718096',
                    borderBottom: activeTab === 'marks' ? '3px solid var(--interactive)' : '3px solid transparent',
                    whiteSpace: 'nowrap', transition: 'all 0.3s'
                  }}
                >
                  Marks & Grades
                </button>
                <button 
                  onClick={() => setActiveTab('attendance')}
                  style={{ 
                    background: 'none', border: 'none', padding: '8px 0', fontSize: '1.1rem', cursor: 'pointer',
                    fontWeight: activeTab === 'attendance' ? '700' : '500',
                    color: activeTab === 'attendance' ? 'var(--interactive)' : '#718096',
                    borderBottom: activeTab === 'attendance' ? '3px solid var(--interactive)' : '3px solid transparent',
                    whiteSpace: 'nowrap', transition: 'all 0.3s'
                  }}
                >
                  Daily Attendance
                </button>
              </div>
              
              <div className="stack-on-mobile" style={{ gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>Semester</label>
                  <select 
                    className="input-field" 
                    style={{ width: '80px', padding: '4px', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                    value={selectedSemester}
                    onChange={(e) => {
                      const sem = Number(e.target.value);
                      setSelectedSemester(sem);
                      fetchStudents(selectedCourse, sem);
                    }}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="stack-on-mobile" style={{ gap: '8px' }}>
                  <button className="btn btn-primary" onClick={openAddStudentPanel} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    <UserPlus size={16} /> Enroll
                  </button>
                  <button className="btn btn-danger" onClick={(e) => handleDeleteCourse(selectedCourse, e)} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: '24px' }}>

            {/* MARKS TAB */}
            {activeTab === 'marks' && (
              students.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>USN / ID</th>
                        <th>Marks Obtained</th>
                        <th>Total Marks</th>
                        <th>Percentage</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((record) => {
                        const total = record.totalMarks || 100;
                        const percentage = total > 0 ? ((record.marks / total) * 100).toFixed(2) : 0;
                        return (
                        <tr key={record._id}>
                          <td data-label="Student Name">{record.studentRef?.name}</td>
                          <td data-label="USN / ID">{record.studentRef?.usnOrEmpId}</td>
                          
                          {editingRecord === record._id ? (
                            <>
                              <td data-label="Marks Obtained">
                                <input 
                                  type="number" 
                                  className="input-field" 
                                  style={{ width: '90px', padding: '8px' }}
                                  value={editForm.marks}
                                  onChange={(e) => setEditForm({...editForm, marks: e.target.value})}
                                />
                              </td>
                              <td data-label="Total Marks">
                                <input 
                                  type="number" 
                                  className="input-field" 
                                  style={{ width: '90px', padding: '8px' }}
                                  value={editForm.totalMarks}
                                  onChange={(e) => setEditForm({...editForm, totalMarks: e.target.value})}
                                />
                              </td>
                              <td data-label="Percentage">-</td>
                              <td data-label="Actions">
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button className="btn btn-primary" style={{ padding: '8px' }} onClick={() => handleSaveMarks(record._id)}>
                                    <Save size={16} />
                                  </button>
                                  <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => setEditingRecord(null)}>
                                    <X size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td data-label="Marks Obtained" style={{ fontWeight: 600 }}>{record.marks}</td>
                              <td data-label="Total Marks" style={{ color: '#718096' }}>{total}</td>
                              <td data-label="Percentage">
                                <span className={`badge ${percentage >= 40 ? 'badge-success' : ''}`} style={{ background: percentage < 40 ? 'rgba(239, 68, 68, 0.1)' : undefined, color: percentage < 40 ? 'var(--accent-danger)' : undefined }}>
                                  {percentage}%
                                </span>
                              </td>
                              <td data-label="Actions">
                                <button className="btn" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--interactive)', padding: '8px 16px' }} onClick={() => handleEdit(record)}>
                                  <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>No students enrolled in this course.</p>
              )
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
              students.length > 0 ? (
                <div>
                  <div className="dashboard-header" style={{ marginBottom: '24px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Attendance Date</label>
                        <input 
                          type="date" 
                          className="input-field" 
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: '120px' }}>
                        <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Period Slot</label>
                        <select 
                          className="input-field" 
                          value={attendanceSlot}
                          onChange={(e) => setAttendanceSlot(Number(e.target.value))}
                        >
                          {[1,2,3,4,5,6].map(slot => (
                            <option key={slot} value={slot}>Slot {slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleSaveAttendance} style={{ minWidth: '200px' }}>
                      <Calendar size={18} /> Save Attendance
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>USN / ID</th>
                          <th>Status (P/A/NA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((record) => {
                          const studentId = record.studentRef?._id;
                          const currentStatus = attendanceRecords[studentId] || 'P';
                          return (
                            <tr key={studentId}>
                              <td data-label="Student Name">{record.studentRef?.name}</td>
                              <td data-label="USN / ID">{record.studentRef?.usnOrEmpId}</td>
                              <td data-label="Status">
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  {['P', 'A', 'NA'].map(status => (
                                    <button 
                                      key={status}
                                      onClick={() => setAttendanceRecords({...attendanceRecords, [studentId]: status})}
                                      style={{
                                        border: 'none',
                                        padding: '6px 16px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        background: currentStatus === status 
                                          ? (status === 'P' ? '#10b981' : status === 'A' ? '#ef4444' : '#3b82f6')
                                          : '#f1f5f9',
                                        color: currentStatus === status ? 'white' : '#64748b',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      {status}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>No students enrolled in this course.</p>
              )
            )}
          </div>
          </div>
        )}
      </motion.div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddCourse && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}
          >
            <motion.div 
              className="glass-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ width: '95%', maxWidth: '450px', padding: '30px 20px', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
            >
              <h2 className="cursive-accent" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2rem', color: '#1a202c', fontWeight: 'bold' }}>Add New Subject</h2>
              <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" className="input-field" placeholder="Subject Name" required 
                  style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                  value={courseFormData.courseName} onChange={e => setCourseFormData({...courseFormData, courseName: e.target.value})} />
                <input type="text" className="input-field" placeholder="Subject Code" required 
                  style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                  value={courseFormData.courseCode} onChange={e => setCourseFormData({...courseFormData, courseCode: e.target.value})} />
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '54px', borderRadius: '18px' }}>Create</button>
                  <button type="button" className="btn" style={{ flex: 1, height: '54px', borderRadius: '18px', background: 'rgba(0,0,0,0.05)', color: '#4a5568' }} onClick={() => setShowAddCourse(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Student Panel — Two sections: Existing Students + New Student Form */}
      <AnimatePresence>
        {showAddStudent && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}
          >
            <motion.div 
              className="glass-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ width: '95%', maxWidth: '520px', maxHeight: '90vh', padding: '24px 16px', borderRadius: '40px', border: '1px solid rgba(255, 255, 255, 0.6)', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column' }}
            >
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h2 className="cursive-accent" style={{ margin: 0, fontSize: '1.8rem', color: '#1a202c', fontWeight: 'bold' }}>Enroll Student</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>Sem:</label>
                  <select 
                    className="input-field" 
                    style={{ width: '80px', padding: '6px' }}
                    value={enrollFormSemester}
                    onChange={(e) => setEnrollFormSemester(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={() => setShowAddStudent(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096', padding: '4px' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Existing Students Section */}
              {!showNewStudentForm && (
                <>
                  {/* Search */}
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Search existing students..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c', paddingLeft: '40px' }}
                    />
                  </div>

                  {/* Student List */}
                  <div style={{ overflowY: 'auto', maxHeight: '300px', marginBottom: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    {availableStudents.length > 0 ? (
                      availableStudents.map(student => (
                        <div 
                          key={student._id} 
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', 
                              background: 'var(--interactive)', color: 'white', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', 
                              fontWeight: 'bold', fontSize: '0.85rem', fontFamily: 'var(--font-serif)'
                            }}>
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#1a202c' }}>{student.name}</p>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>{student.usnOrEmpId} · {student.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleQuickEnroll(student._id)}
                            style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', 
                              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: 'var(--interactive)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--interactive)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = 'var(--interactive)'; }}
                            title="Quick enroll"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem' }}>
                        {searchQuery ? 'No matching students found.' : 'No existing students available to enroll.'}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.8rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  {/* Add New Student Button */}
                  <button 
                    className="btn" 
                    onClick={() => setShowNewStudentForm(true)}
                    style={{ 
                      width: '100%', height: '54px', borderRadius: '18px', 
                      background: 'linear-gradient(135deg, #2d3748, #4a5568)', 
                      color: 'white', fontSize: '1rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    <UserPlus size={18} /> Register New Student
                  </button>
                </>
              )}

              {/* New Student Form */}
              {showNewStudentForm && (
                <>
                  <button 
                    onClick={() => setShowNewStudentForm(false)}
                    style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: 'var(--interactive)', fontSize: '0.9rem', 
                      marginBottom: '16px', padding: 0, textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    ← Back to student list
                  </button>
                  <form onSubmit={handleAddNewStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" className="input-field" placeholder="Student Full Name" required 
                      style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                      value={studentFormData.name} onChange={e => setStudentFormData({...studentFormData, name: e.target.value})} />
                    <input type="email" className="input-field" placeholder="Email Address" required 
                      style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                      value={studentFormData.email} onChange={e => setStudentFormData({...studentFormData, email: e.target.value})} />
                    <input type="text" className="input-field" placeholder="USN" required 
                      style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                      value={studentFormData.usnOrEmpId} onChange={e => setStudentFormData({...studentFormData, usnOrEmpId: e.target.value})} />
                    <input type="password" className="input-field" placeholder="Set Password for Student" required 
                      style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                      value={studentFormData.password} onChange={e => setStudentFormData({...studentFormData, password: e.target.value})} />
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '54px', borderRadius: '18px' }}>Create & Enroll</button>
                      <button type="button" className="btn" style={{ flex: 1, height: '54px', borderRadius: '18px', background: 'rgba(0,0,0,0.05)', color: '#4a5568' }} onClick={() => { setShowNewStudentForm(false); setShowAddStudent(false); }}>Cancel</button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default FacultyDashboard;
