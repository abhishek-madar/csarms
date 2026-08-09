import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Clock, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const fetchRecords = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/student/records`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRecords(data);
      } catch (error) {
        console.error('Error fetching records', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user.token]);

  // Filtered records based on selection
  const filteredRecords = selectedSemester === 'all' 
    ? records 
    : records.filter(r => r.semester === Number(selectedSemester));

  // Calculate KPIs based on filtered records
  const avgMarks = filteredRecords.length > 0 
    ? (filteredRecords.reduce((acc, r) => acc + (r.marks / (r.totalMarks || 100)) * 100, 0) / filteredRecords.length).toFixed(1) 
    : 0;
  
  const avgAttendance = filteredRecords.length > 0
    ? (filteredRecords.reduce((acc, r) => acc + r.attendance, 0) / filteredRecords.length).toFixed(1)
    : 0;

  // Chart Data preparation (group by semester)
  const chartData = records.reduce((acc, record) => {
    const existing = acc.find(item => item.semester === `Sem ${record.semester}`);
    const percentage = (record.marks / (record.totalMarks || 100)) * 100;
    if (existing) {
      existing.marks = (existing.marks + percentage) / 2;
      existing.attendance = (existing.attendance + record.attendance) / 2;
    } else {
      acc.push({ 
        semester: `Sem ${record.semester}`, 
        marks: percentage,
        attendance: record.attendance
      });
    }
    return acc;
  }, []).sort((a, b) => a.semester.localeCompare(b.semester));

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-card" style={{ 
          padding: '40px', 
          borderRadius: '32px', 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '300px', height: '300px', background: 'var(--interactive)', opacity: 0.05, borderRadius: '50%', filter: 'blur(60px)' }}></div>
          <div className="dashboard-header" style={{ position: 'relative', zIndex: 1, marginBottom: 0 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '8px' }}>Hello, {user.name.split(' ')[0]}!</h1>
              <p className="subtitle" style={{ fontSize: '1.1rem' }}>You're doing great. Here's your academic journey at a glance.</p>
            </div>
            <div className="stack-on-mobile" style={{ gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: 800, color: '#718096', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Semester</label>
                <select 
                  className="input-field" 
                  style={{ width: '130px', padding: '8px', border: 'none', background: 'transparent', fontWeight: 700, color: 'var(--interactive)' }}
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="all">Overview</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-cards" style={{ marginBottom: '40px' }}>
          <div className="glass-card stack-on-mobile" style={{ padding: '32px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="icon-container" style={{ 
              background: 'linear-gradient(135deg, var(--interactive), #34d399)', 
              minWidth: '72px', height: '72px', 
              borderRadius: '22px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', 
              boxShadow: '0 15px 30px -10px rgba(16, 185, 129, 0.4)',
              flexShrink: 0 
            }}>
              <Award size={36} />
            </div>
            <div>
              <p className="input-label" style={{ margin: 0, opacity: 0.6, fontSize: '1rem' }}>Average Score</p>
              <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: '#1a202c' }}>{avgMarks}%</h2>
            </div>
          </div>
          
          <div className="glass-card stack-on-mobile" style={{ padding: '32px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="icon-container" style={{ 
              background: 'linear-gradient(135deg, #b5c4b1, #dce4da)', 
              minWidth: '72px', height: '72px', 
              borderRadius: '22px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', 
              boxShadow: '0 15px 30px -10px rgba(181, 196, 177, 0.4)',
              flexShrink: 0 
            }}>
              <BookOpen size={36} />
            </div>
            <div>
              <p className="input-label" style={{ margin: 0, opacity: 0.6, fontSize: '1rem' }}>Total Courses</p>
              <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: '#1a202c' }}>{filteredRecords.length}</h2>
            </div>
          </div>
        </div>

        <div className="responsive-grid" style={{ marginBottom: '40px' }}>
          <div className="glass-card">
            <h2 className="cursive-accent" style={{ marginBottom: '24px' }}>Marks Progression</h2>
            <div className="chart-container">
              {isMounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--interactive)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--interactive)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="marks" stroke="var(--interactive)" strokeWidth={4} dot={{ r: 6, fill: 'var(--interactive)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No data available.</p>
              )}
            </div>
          </div>

          <div className="glass-card">
            <h2 className="cursive-accent" style={{ marginBottom: '24px', color: '#c9a882' }}>Attendance Tracking</h2>
            <div className="chart-container">
              {isMounted && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a882" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#c9a882" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="semester" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="attendance" stroke="#c9a882" strokeWidth={4} dot={{ r: 6, fill: '#c9a882', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No data available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="semester-groups">
          {Object.keys(filteredRecords.reduce((acc, r) => {
            if (!acc[r.semester]) acc[r.semester] = [];
            acc[r.semester].push(r);
            return acc;
          }, {})).sort((a, b) => b - a).map(sem => {
            const semRecords = filteredRecords.filter(r => r.semester === Number(sem));
            return (
              <div key={sem} className="glass-card mb-4" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="dashboard-header" style={{ padding: '24px 24px 0 24px', marginBottom: '16px' }}>
                  <h2 className="cursive-accent" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', padding: '6px 16px', background: 'var(--interactive)', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>Semester {sem}</span>
                    Academic Performance
                  </h2>
                </div>
                <div style={{ padding: '0 24px 24px 24px' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Faculty</th>
                          <th>Marks</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semRecords.map((record) => {
                          const total = record.totalMarks || 100;
                          const perc = total > 0 ? ((record.marks / total) * 100).toFixed(2) : 0;
                          return (
                            <tr key={record._id}>
                              <td data-label="Course Code">{record.courseRef?.courseCode}</td>
                              <td data-label="Course Name">{record.courseRef?.courseName}</td>
                              <td data-label="Faculty">
                                {record.courseRef?.assignedFacultyRef ? (
                                  <NavLink to={`/faculty/${record.courseRef.assignedFacultyRef._id}`} style={{ color: 'var(--interactive)', fontWeight: 600, textDecoration: 'none' }}>
                                    {record.courseRef.assignedFacultyRef.name}
                                  </NavLink>
                                ) : 'Not Assigned'}
                              </td>
                              <td data-label="Marks" style={{ fontWeight: 600 }}>{record.marks} <span style={{ color: '#718096', fontSize: '0.85rem' }}>/ {total}</span></td>
                              <td data-label="Percentage">
                                <span className={`badge ${perc >= 40 ? 'badge-success' : ''}`} style={{ background: perc < 40 ? 'rgba(239, 68, 68, 0.1)' : undefined, color: perc < 40 ? 'var(--accent-danger)' : undefined }}>
                                  {perc}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
          {records.length === 0 && (
            <div className="glass-card">
              <p>No records found.</p>
            </div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default StudentDashboard;
