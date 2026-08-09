import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, User, Lock, Mail, UserPlus } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);
  const [escalationData, setEscalationData] = useState({ 
    name: '', 
    usnOrEmpId: '', 
    reason: '',
    collegeName: '',
    subjectName: '',
    className: '',
    year: '',
    contactEmail: ''
  });
  const [escalationMsg, setEscalationMsg] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // We pass the role but the server is now 'Dynamic' and will auto-correct if it's wrong
      const userData = await login(email, password, role);
      console.log('Logged in as:', userData.role);
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to server. Please try again.');
      } else if (err.response.status === 401) {
        setError('Invalid email or password.');
        setShowEscalation(true);
      } else {
        setError(err.response.data?.message || 'Login failed');
      }
    }
  };

  const handleEscalationSubmit = (e) => {
    e.preventDefault();
    
    // Construct the email body with all form information
    const body = `
Request for ${role} Access
-------------------------
Name: ${escalationData.name}
ID (USN/EMP): ${escalationData.usnOrEmpId || 'N/A'}
Email: ${email}
Contact Email: ${escalationData.contactEmail || 'N/A'}
${role === 'HOD' ? `College: ${escalationData.collegeName}` : ''}
${role === 'Faculty' ? `Subject: ${escalationData.subjectName}` : ''}
${role === 'Student' ? `Class: ${escalationData.className} | Year: ${escalationData.year}` : ''}

Reason/Notes:
${escalationData.reason || 'No additional notes.'}

-------------------------
Please grant me access to the CSARMS platform.
    `.trim();

    const subject = encodeURIComponent(`${role} Access Request - ${escalationData.name}`);
    const encodedBody = encodeURIComponent(body);
    const mailtoLink = `mailto:abhishekbadagi06@gmail.com?subject=${subject}&body=${encodedBody}`;

    // Redirect to email app
    window.location.href = mailtoLink;
    
    setEscalationMsg('Redirecting to your email app... Please send the generated email to complete your request.');
    setShowEscalation(false);
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card glass-card"
      >
        <div className="login-header">
          <div className="logo-container" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--interactive)' }}>
            <BookOpen size={48} className="logo-icon" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#1a202c' }}>CSARMS</h1>
          <p className="cursive-accent" style={{ fontSize: '1.2rem', marginTop: '-4px' }}>Educational Management System</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Select Role</label>
            <div className="role-selector">
              {['Student', 'Faculty', 'HOD', 'Admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-btn ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="input-field with-icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="input-field with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="form-footer">
            <label className="remember-me">
              <input type="checkbox" /> 
              <span>Remember Me</span>
            </label>
            <button type="button" className="forgot-password" onClick={() => alert('Feature coming soon!')}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
            Login
          </button>
        </form>

        {showEscalation && (
          <div className="escalation-container">
            <h3 className="escalation-header">
              <UserPlus size={18} /> Account Not Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              It seems you don't have an account yet. Would you like to request access from the {role === 'Student' ? 'Faculty' : role === 'Faculty' ? 'HOD' : 'System Admin'}?
            </p>
            
            {!escalationMsg ? (
              <form onSubmit={handleEscalationSubmit} className="escalation-form">
                <input type="text" className="input-field" placeholder="Full Name" required 
                  value={escalationData.name} onChange={e => setEscalationData({...escalationData, name: e.target.value})} />
                
                <input type="text" className="input-field" placeholder={role === 'Student' ? 'USN' : 'Employee ID'} 
                  value={escalationData.usnOrEmpId} onChange={e => setEscalationData({...escalationData, usnOrEmpId: e.target.value})} />

                {role === 'HOD' && (
                  <input type="text" className="input-field" placeholder="College Name" required 
                    value={escalationData.collegeName} onChange={e => setEscalationData({...escalationData, collegeName: e.target.value})} />
                )}

                {role === 'Faculty' && (
                  <input type="text" className="input-field" placeholder="Subject Specialization" required 
                    value={escalationData.subjectName} onChange={e => setEscalationData({...escalationData, subjectName: e.target.value})} />
                )}

                {role === 'Student' && (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" className="input-field" placeholder="Class" required 
                        value={escalationData.className} onChange={e => setEscalationData({...escalationData, className: e.target.value})} />
                      <input type="text" className="input-field" placeholder="Year" required 
                        value={escalationData.year} onChange={e => setEscalationData({...escalationData, year: e.target.value})} />
                    </div>
                    <input type="email" className="input-field" placeholder="Contact Email ID" required 
                      value={escalationData.contactEmail} onChange={e => setEscalationData({...escalationData, contactEmail: e.target.value})} />
                  </>
                )}

                <textarea className="input-field" placeholder="Additional Notes" rows={2} 
                  value={escalationData.reason} onChange={e => setEscalationData({...escalationData, reason: e.target.value})} />
                
                <button type="submit" className="submit-request-btn">Submit Request</button>
              </form>
            ) : (
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--interactive)', borderRadius: '8px', fontSize: '0.85rem' }}>
                {escalationMsg}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
