import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { User, Mail, Hash, Building, Calendar, Phone, Edit2, Save, X, Camera } from 'lucide-react';

import { useParams } from 'react-router-dom';

const StaffProfile = () => {
  const { id } = useParams(); // Optional ID for viewing others
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', dob: '', phone: '', profilePicture: '' });

  const isOwnProfile = !id || id === user._id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const url = id ? `${API_BASE_URL}/api/auth/profile/${id}` : `${API_BASE_URL}/api/auth/profile`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfile(data);
      setFormData({
        name: data.name || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        phone: data.phone || '',
        profilePicture: data.profilePicture || ''
      });
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfile(data);
      setIsEditing(false);
      
      // Update the user context if the name or picture changed
      if (user.name !== data.name || user.profilePicture !== data.profilePicture) {
        updateUser({ ...user, name: data.name, profilePicture: data.profilePicture });
      }
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <div>
            <h1>{isOwnProfile ? 'My Profile' : `${profile.role} Profile`}</h1>
            <p className="subtitle">{isOwnProfile ? 'Manage your personal and professional information.' : `Viewing information for ${profile.name}`}</p>
          </div>
          {!isEditing && isOwnProfile && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Header Banner */}
          <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--interactive), #3b82f6)' }}></div>
          
          <div style={{ padding: '0 32px 32px 32px', position: 'relative' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: '100px', height: '100px', marginTop: '-50px', marginBottom: '24px' }}>
              <div style={{ 
                width: '100%', height: '100%', borderRadius: '50%', 
                background: 'white', border: '4px solid #f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--interactive)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                backgroundImage: profile.profilePicture ? `url(${profile.profilePicture})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!profile.profilePicture && profile.name.charAt(0)}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="profile-grid" style={{ paddingTop: '24px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 className="cursive-accent" style={{ marginBottom: '16px', color: '#c9a882' }}>Edit Information</h3>
                </div>

                <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
                  <label className="input-label">Profile Picture</label>
                  <div className="stack-on-mobile" style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      backgroundImage: formData.profilePicture ? `url(${formData.profilePicture})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0
                    }}>
                      {!formData.profilePicture && <Camera size={24} color="#a0aec0" />}
                    </div>
                    <input 
                      type="file" accept="image/*" 
                      onChange={handleImageChange}
                      style={{ fontSize: '0.9rem', color: '#4a5568' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#718096', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                  <input 
                    type="text" className="input-field" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#718096', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Phone Number</label>
                  <input 
                    type="tel" className="input-field" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#718096', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Date of Birth</label>
                  <input 
                    type="date" className="input-field" 
                    value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>

                {/* Department — read-only, assigned by HOD, fetched from server */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#718096', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Department</label>
                  <div style={{
                    padding: '12px 16px', borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <Building size={16} color="var(--interactive)" />
                    <span style={{ fontWeight: 600, color: '#1a202c', fontSize: '0.95rem' }}>
                      {profile.department || 'Not Assigned'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0', marginLeft: 'auto' }}>Assigned by HOD</span>
                  </div>
                </div>

                <div className="stack-on-mobile" style={{ gridColumn: '1 / -1', marginTop: '16px', gap: '16px' }}>
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} /> Save Changes
                  </button>
                  <button type="button" className="btn" onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#4a5568' }}>
                    <X size={18} /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-grid" style={{ paddingTop: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <User size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>Full Name</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>{profile.name}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <Hash size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>{profile.role === 'Faculty' ? 'Employee ID' : 'ID'}</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>{profile.usnOrEmpId}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div style={{ wordBreak: 'break-word' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>{profile.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>Department</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>{profile.department || 'Not Assigned'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', color: 'var(--interactive)', flexShrink: 0 }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>Date of Birth</p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: 500, color: '#1a202c', fontSize: '1.1rem' }}>
                      {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StaffProfile;
