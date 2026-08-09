import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Building, ChevronDown, ChevronRight, Plus, FolderPlus } from 'lucide-react';

const HodDashboard = () => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [facultyFormData, setFacultyFormData] = useState({ name: '', email: '', password: '', usnOrEmpId: '', department: '' });
  const [deptFormData, setDeptFormData] = useState({ name: '' });
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/hod/faculty`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/hod/departments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if(window.confirm('Are you sure you want to remove this Faculty member?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/hod/faculty/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchFaculty();
      } catch (error) {
        console.error('Error deleting faculty:', error);
      }
    }
  };

  const handleDeleteDept = async (id) => {
    if(window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/hod/departments/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchDepartments();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting department');
      }
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/hod/faculty`, facultyFormData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddFacultyModal(false);
      setFacultyFormData({ name: '', email: '', password: '', usnOrEmpId: '', department: '' });
      fetchFaculty();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding faculty');
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/hod/departments`, deptFormData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddDeptModal(false);
      setDeptFormData({ name: '' });
      fetchDepartments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding department');
    }
  };

  const openAddFacultyModal = (deptName) => {
    setFacultyFormData({ ...facultyFormData, department: deptName });
    setShowAddFacultyModal(true);
  };

  // Group faculty by department
  const groupedFaculty = departments.reduce((acc, dept) => {
    acc[dept.name] = faculty.filter(f => f.department === dept.name);
    return acc;
  }, {});

  const toggleDept = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  const deptColors = ['#10b981', '#c9a882', '#6366f1', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6'];

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-header">
          <div>
            <h1>HOD Dashboard</h1>
            <p className="subtitle">Structure your departments and manage faculty efficiently.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddDeptModal(true)}>
            <FolderPlus size={20} /> Add Department
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid-cards">
          <div className="glass-card stack-on-mobile" style={{ padding: '24px' }}>
            <div>
              <p className="input-label" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--interactive)', textTransform: 'none', marginBottom: '4px' }}>Active Departments</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#1a202c' }}>{departments.length}</h2>
            </div>
            <div className="icon-container" style={{ 
              background: 'linear-gradient(135deg, var(--interactive), #34d399)', 
              width: '64px', height: '64px', 
              borderRadius: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', 
              boxShadow: '0 12px 24px -8px rgba(16, 185, 129, 0.4)',
              flexShrink: 0 
            }}>
              <Building size={32} />
            </div>
          </div>
          <div className="glass-card stack-on-mobile" style={{ padding: '24px' }}>
            <div>
              <p className="input-label" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#c9a882', textTransform: 'none', marginBottom: '4px' }}>Total Faculty Members</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#1a202c' }}>{faculty.length}</h2>
            </div>
            <div className="icon-container" style={{ 
              background: 'linear-gradient(135deg, #c9a882, #e2d1c3)', 
              width: '64px', height: '64px', 
              borderRadius: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', 
              boxShadow: '0 12px 24px -8px rgba(201, 168, 130, 0.4)',
              flexShrink: 0 
            }}>
              <Users size={32} />
            </div>
          </div>
        </div>

        {/* Department Hierarchy */}
        <div className="glass-card">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h2 className="cursive-accent" style={{ color: '#c9a882', margin: 0, fontWeight: 'bold' }}>Department Hierarchy</h2>
          </div>

          {departments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {departments.map((dept, idx) => (
                <div key={dept._id} style={{ borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {/* Department Header */}
                  <div 
                    className="responsive-flex"
                    style={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 20px', 
                      background: expandedDept === dept.name ? 'rgba(16, 185, 129, 0.04)' : '#fafbfc',
                      transition: 'background 0.2s',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flex: 1, minWidth: '200px' }} onClick={() => toggleDept(dept.name)}>
                      {expandedDept === dept.name ? <ChevronDown size={18} color="#718096" /> : <ChevronRight size={18} color="#718096" />}
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: deptColors[idx % deptColors.length] }} />
                      <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a202c', fontFamily: 'var(--font-serif)' }}>{dept.name}</span>
                      <span style={{ marginLeft: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--interactive)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {groupedFaculty[dept.name]?.length || 0}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => openAddFacultyModal(dept.name)}
                        className="btn" 
                        style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--interactive)', padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={16} /> Add Faculty
                      </button>
                      <button 
                        onClick={() => handleDeleteDept(dept._id)}
                        className="icon-btn" 
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Faculty List (Expandable) */}
                  {expandedDept === dept.name && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ borderTop: '1px solid #e2e8f0', background: 'white' }}
                    >
                      {groupedFaculty[dept.name]?.length > 0 ? (
                        groupedFaculty[dept.name].map(f => (
                          <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.95rem' }}>{f.name}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>{f.usnOrEmpId} · {f.email}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFaculty(f._id)} className="icon-btn" style={{ color: '#ef4444' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          No faculty members in this department yet.
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', background: '#fafbfc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
              <FolderPlus size={48} style={{ color: '#a0aec0', marginBottom: '16px' }} />
              <p style={{ color: '#718096', fontSize: '1.1rem' }}>No departments created yet.</p>
              <button className="btn btn-primary" onClick={() => setShowAddDeptModal(true)} style={{ marginTop: '16px' }}>
                Add Your First Department
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Department Modal */}
      <AnimatePresence>
        {showAddDeptModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
            <motion.div className="glass-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ width: '95%', maxWidth: '400px', padding: '32px 20px', borderRadius: '32px' }}>
              <h2 className="cursive-accent" style={{ textAlign: 'center', marginBottom: '24px' }}>New Department</h2>
              <form onSubmit={handleDeptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" className="input-field" placeholder="Department Name (e.g. Computer Science)" required value={deptFormData.name} onChange={e => setDeptFormData({ name: e.target.value })} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                  <button type="button" className="btn" style={{ flex: 1, background: '#edf2f7' }} onClick={() => setShowAddDeptModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Faculty Modal */}
      <AnimatePresence>
        {showAddFacultyModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
            <motion.div className="glass-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ width: '95%', maxWidth: '450px', padding: '32px 20px', borderRadius: '32px' }}>
              <h2 className="cursive-accent" style={{ textAlign: 'center', marginBottom: '8px' }}>Add Faculty</h2>
              <p style={{ textAlign: 'center', color: 'var(--interactive)', marginBottom: '24px', fontWeight: 600 }}>{facultyFormData.department}</p>
              
              <form onSubmit={handleFacultySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" className="input-field" placeholder="Full Name" required value={facultyFormData.name} onChange={e => setFacultyFormData({ ...facultyFormData, name: e.target.value })} />
                <input type="email" className="input-field" placeholder="Email Address" required value={facultyFormData.email} onChange={e => setFacultyFormData({ ...facultyFormData, email: e.target.value })} />
                <input type="password" className="input-field" placeholder="Password" required value={facultyFormData.password} onChange={e => setFacultyFormData({ ...facultyFormData, password: e.target.value })} />
                <input type="text" className="input-field" placeholder="Employee ID" required value={facultyFormData.usnOrEmpId} onChange={e => setFacultyFormData({ ...facultyFormData, usnOrEmpId: e.target.value })} />
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                  <button type="button" className="btn" style={{ flex: 1, background: '#edf2f7' }} onClick={() => setShowAddFacultyModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default HodDashboard;
