import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, BookOpen, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, totalCourses: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', usnOrEmpId: '', department: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchHODs();
  }, [user.token]);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/system-stats`, { headers: { Authorization: `Bearer ${user.token}` } });
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const fetchHODs = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/hods`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(data);
    } catch (error) {
      console.error('Error fetching HODs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/admin/hods`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', usnOrEmpId: '', department: '' });
      fetchHODs();
      fetchStats();
    } catch (error) {
      console.error('Error adding HOD:', error);
      alert(error.response?.data?.message || 'Failed to add HOD');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to remove this HOD?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/hods/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchHODs();
        fetchStats();
      } catch (error) {
        console.error('Error deleting HOD:', error);
      }
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-header">
          <div>
            <h1>Admin Control Panel</h1>
            <p className="subtitle">System overview and HOD management.</p>
          </div>
        </div>

        <div className="grid-cards">
          <div className="glass-card stack-on-mobile" style={{ padding: '24px' }}>
            <div>
              <p className="input-label" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--interactive)', textTransform: 'none', marginBottom: '4px' }}>Total Students</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#1a202c' }}>{stats.totalStudents}</h2>
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
              <GraduationCap size={32} />
            </div>
          </div>
          
          <div className="glass-card stack-on-mobile" style={{ padding: '24px' }}>
            <div>
              <p className="input-label" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#c9a882', textTransform: 'none', marginBottom: '4px' }}>Total Faculty</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#1a202c' }}>{stats.totalFaculty}</h2>
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

          <div className="glass-card stack-on-mobile" style={{ padding: '24px' }}>
            <div>
              <p className="input-label" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#b5c4b1', textTransform: 'none', marginBottom: '4px' }}>Total Courses</p>
              <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#1a202c' }}>{stats.totalCourses}</h2>
            </div>
            <div className="icon-container" style={{ 
              background: 'linear-gradient(135deg, #b5c4b1, #dce4da)', 
              width: '64px', height: '64px', 
              borderRadius: '20px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', 
              boxShadow: '0 12px 24px -8px rgba(181, 196, 177, 0.4)',
              flexShrink: 0 
            }}>
              <BookOpen size={32} />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h2 className="cursive-accent" style={{ color: '#c9a882', margin: 0, fontWeight: 'bold' }}>HOD Management</h2>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>Add New HOD</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td data-label="Name">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td data-label="ID">{u.usnOrEmpId}</td>
                    <td data-label="Email" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td data-label="Department">
                      <span style={{
                        background: u.department ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                        color: u.department ? 'var(--interactive)' : '#a0aec0',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {u.department || 'Not Assigned'}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="icon-btn" onClick={() => handleDelete(u._id)} title="Remove HOD">
                          <Trash2 size={18} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0,
              bottom: 0,
              width: '100vw', 
              height: '100vh', 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(20px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 3000 
            }}
          >
            <motion.div 
              className="glass-card"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ 
                width: '95%',
                maxWidth: '450px', 
                padding: '30px 20px', 
                borderRadius: '40px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
              }}
            >
              <h2 className="cursive-accent" style={{ marginBottom: '32px', textAlign: 'center', fontSize: '2rem', color: '#1a202c', fontWeight: 'bold' }}>Add Head of Department</h2>
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="Full Name" required 
                    style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <input type="email" className="input-field" placeholder="Email Address" required 
                    style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="input-group">
                  <input type="password" className="input-field" placeholder="Password" required 
                    style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="Employee ID / College ID" required 
                    style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                    value={formData.usnOrEmpId} onChange={e => setFormData({...formData, usnOrEmpId: e.target.value})} />
                </div>
                <div className="input-group">
                  <input type="text" className="input-field" placeholder="Department (e.g. Computer Science)" required
                    style={{ borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1a202c' }}
                    value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
                
                <div className="stack-on-mobile" style={{ marginTop: '12px', gap: '16px' }}>
                  <button type="submit" className="btn btn-primary" style={{ height: '54px' }}>Create Account</button>
                  <button type="button" className="btn" style={{ height: '54px', background: 'rgba(0,0,0,0.05)', color: '#4a5568' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminDashboard;
