import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const StudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [detailed, setDetailed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'detailed'
  const [selectedSemester, setSelectedSemester] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAttendance();
  }, [user.token]);

  const fetchAttendance = async () => {
    try {
      const summaryRes = await axios.get(`${API_BASE_URL}/api/student/attendance/summary`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSummary(summaryRes.data);

      const detailedRes = await axios.get(`${API_BASE_URL}/api/student/attendance/detailed`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDetailed(detailedRes.data);
    } catch (error) {
      console.error('Error fetching attendance', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered summary
  const filteredSummary = selectedSemester === 'all'
    ? summary
    : summary.filter(s => s.semester === Number(selectedSemester));

  // Calculate overall percentage based on filtered data
  const totalClasses = filteredSummary.reduce((acc, curr) => acc + curr.total, 0);
  const totalPresent = filteredSummary.reduce((acc, curr) => acc + curr.present, 0);
  const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : '0.00';

  // Process detailed data into a grid format
  // Filter detailed data by semester
  const filteredDetailed = selectedSemester === 'all'
    ? detailed
    : detailed.filter(d => d.semester === Number(selectedSemester));

  const gridData = {};
  filteredDetailed.forEach(record => {
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    if (!gridData[dateStr]) {
      gridData[dateStr] = { 1: '-', 2: '-', 3: '-', 4: '-', 5: '-', 6: '-' };
    }
    gridData[dateStr][record.slot] = record.status;
  });

  // Sort dates descending
  const sortedDates = Object.keys(gridData).sort((a, b) => new Date(b) - new Date(a));

  const getStatusColor = (status) => {
    switch(status) {
      case 'P': return { bg: '#e6f4ea', color: '#137333' }; // Green
      case 'A': return { bg: '#fce8e6', color: '#c5221f' }; // Red
      case 'NA': return { bg: '#e8f0fe', color: '#1967d2' }; // Blue
      default: return { bg: '#f8f9fa', color: '#5f6368' }; // Grey for '-'
    }
  };

  // Format date for grid (e.g., "07-May-26 Thu")
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const weekday = date.toLocaleString('default', { weekday: 'short' });
    return (
      <div style={{ textAlign: 'center', fontSize: '0.85rem', lineHeight: '1.2' }}>
        <div>{day}-{month}-{year}</div>
        <div>{weekday}</div>
      </div>
    );
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0 }}>Attendance</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontWeight: 600, color: '#718096', fontSize: '0.9rem' }}>Semester:</label>
            <select 
              className="input-field" 
              style={{ width: '120px', padding: '8px' }}
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="all">All</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
        </div>

        {/* Top Header - mimicking screenshot */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <button 
              onClick={() => setActiveTab('summary')}
              style={{
                flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === 'summary' ? 'bold' : 'normal',
                color: activeTab === 'summary' ? '#1a202c' : '#718096',
                borderBottom: activeTab === 'summary' ? '3px solid var(--interactive)' : 'none',
                fontSize: '1rem'
              }}
            >
              Subject Summary
            </button>
            <button 
              onClick={() => setActiveTab('detailed')}
              style={{
                flex: 1, padding: '16px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: activeTab === 'detailed' ? 'bold' : 'normal',
                color: activeTab === 'detailed' ? '#1a202c' : '#718096',
                borderBottom: activeTab === 'detailed' ? '3px solid var(--interactive)' : 'none',
                fontSize: '1rem'
              }}
            >
              Daily Detailed
            </button>
          </div>

        </div>

        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#4a5568' }}>
              <div>Subject</div>
              <div style={{ textAlign: 'left' }}>Faculty</div>
              <div style={{ textAlign: 'center' }}>Total</div>
              <div style={{ textAlign: 'center' }}>Present</div>
            </div>
            
            {filteredSummary.map((sub, idx) => {
              const perc = Number(sub.percentage);
              const isGood = perc >= 75;
              return (
                <div key={idx} style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a202c' }}>
                      {sub.courseCode} - {sub.courseName}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <NavLink to={`/faculty/${sub.faculty?._id}`} style={{ color: 'var(--interactive)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                          {sub.faculty?.name || 'Faculty'}
                        </NavLink>
                    </div>
                    <div style={{ textAlign: 'center', fontWeight: 600 }}>{sub.total}</div>
                    <div style={{ textAlign: 'center', fontWeight: 600 }}>{sub.present}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                    <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${perc}%`, 
                        background: isGood ? '#10b981' : '#ef4444'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isGood ? '#10b981' : '#ef4444', minWidth: '50px', textAlign: 'right' }}>
                      {perc.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {summary.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>No attendance data available yet.</div>}
          </div>
        )}

        {/* DETAILED TAB */}
        {activeTab === 'detailed' && (
          <>
            <div className="glass-card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', padding: '16px 24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>Present</div>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>{totalPresent} / {totalClasses}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>Absent</div>
                <div style={{ fontWeight: 'bold', color: '#ef4444' }}>{totalClasses - totalPresent} / {totalClasses}</div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px', fontSize: '0.85rem', color: '#4a5568', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                P = Present, A = Absent, NA = No Attendance, - = No Lecture/Lab
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: '#4a5568' }}>Date</th>
                      {[1,2,3,4,5,6].map(slot => (
                        <th key={slot} style={{ padding: '16px 8px', fontWeight: 600, color: '#4a5568', fontSize: '0.9rem' }}>
                          Slot<br/>{slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDates.map((dateStr) => (
                      <tr key={dateStr} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {formatDate(dateStr)}
                        </td>
                        {[1,2,3,4,5,6].map(slot => {
                          const status = gridData[dateStr][slot];
                          const colors = getStatusColor(status);
                          return (
                            <td key={slot} style={{ padding: '4px' }}>
                              <div style={{ 
                                background: colors.bg, 
                                color: colors.color,
                                padding: '12px 8px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}>
                                {status}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {sortedDates.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ padding: '40px', color: '#718096' }}>No daily records available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
};

export default StudentAttendance;
