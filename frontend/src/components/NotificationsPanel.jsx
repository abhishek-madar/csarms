import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Bell, Plus, Trash2 } from 'lucide-react';
import './NotificationsPanel.css';

const NotificationsPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Event');
  const [recipientRole, setRecipientRole] = useState('ALL');
  const [durationHours, setDurationHours] = useState(24);
  const [mediaFile, setMediaFile] = useState(null);

  const canCreate = ['Admin', 'Faculty', 'HOD'].includes(user.role);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('type', type);
      formData.append('durationHours', durationHours);
      
      // Only Admin sends recipientRole explicitly (if needed), though backend handles string parsing
      if (user.role === 'Admin') {
        formData.append('recipientRoles', JSON.stringify([recipientRole]));
      }
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await axios.post(`${API_BASE_URL}/api/notifications`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`
        }
      });
      setShowForm(false);
      setTitle(''); setMessage(''); setMediaFile(null);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification', error);
    }
  };


  return (
    <div className="notifications-overlay">
      <motion.div 
        className="notifications-overlay-bg" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
      />
      <motion.div 
        className="notifications-panel glass-card"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="panel-header flex-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell className="brand-icon" size={24} />
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Notifications</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {canCreate && (
              <button className="icon-btn" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--interactive)' }} onClick={() => setShowForm(!showForm)}>
                {showForm ? <X size={20} /> : <Plus size={20} />}
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="panel-content">
          {showForm && canCreate ? (
            <motion.form 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="create-notification-form glass-card"
              onSubmit={handleCreate}
              style={{ padding: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.9)' }}
            >
              <h3 className="cursive-accent" style={{ marginBottom: '16px', fontSize: '1.2rem' }}>New Announcement</h3>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Message</label>
                <textarea className="input-field" value={message} onChange={(e) => setMessage(e.target.value)} required rows={3}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Event">Event</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>
                {user.role === 'Admin' && (
                  <div className="input-group">
                    <label className="input-label">Recipient Role</label>
                    <select className="input-field" value={recipientRole} onChange={(e) => setRecipientRole(e.target.value)}>
                      <option value="ALL">All Users</option>
                      <option value="Student">Students Only</option>
                      <option value="Faculty">Faculty Only</option>
                      <option value="HOD">HODs Only</option>
                    </select>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Attach Media (Image/Video)</label>
                  <input type="file" className="input-field" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files[0])} style={{ padding: '8px' }} />
                </div>
                <div className="input-group">
                <label className="input-label">Duration (Hours)</label>
                <input type="number" className="input-field" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} required min={1} />
              </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Broadcast</button>
            </motion.form>
          ) : null}

          {loading ? (
            <div className="loader-container" style={{ height: '200px', background: 'transparent' }}><div className="loader"></div></div>
          ) : notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <motion.div 
                  key={notif._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="notification-card"
                >
                  <div className="flex-between">
                    <span className={`badge ${notif.type === 'AcademicAlert' ? 'badge-success' : ''}`} style={{ 
                      background: notif.type === 'SystemAlert' ? 'rgba(239, 68, 68, 0.1)' : undefined, 
                      color: notif.type === 'SystemAlert' ? 'var(--accent-danger)' : undefined 
                    }}>
                      {notif.type}
                    </span>
                    {(user.role === 'Admin' || notif.senderRef?._id === user.id) && (
                      <button className="icon-btn" style={{ padding: '4px' }} onClick={() => handleDelete(notif._id)}>
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    )}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginTop: '8px', marginBottom: '4px' }}>{notif.title}</h4>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '12px' }}>{notif.message}</p>
                  
                  {notif.mediaUrl && (
                    <div style={{ marginTop: '12px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                      {notif.mediaType === 'video' ? (
                        <video controls style={{ width: '100%', maxHeight: '300px', display: 'block' }}>
                          <source src={`${API_BASE_URL}${notif.mediaUrl}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img src={`${API_BASE_URL}${notif.mediaUrl}`} alt="Attachment" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>From: {notif.senderRef?.role === 'Faculty' && user.role === 'Student' ? (
                      <NavLink to={`/faculty/${notif.senderRef?._id}`} style={{ color: 'var(--interactive)', textDecoration: 'none', fontWeight: 600 }}>
                        {notif.senderRef?.name}
                      </NavLink>
                    ) : notif.senderRef?.name}</span>
                    <span>Expires: {new Date(notif.expiresAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationsPanel;
