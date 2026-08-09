import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Hash, Building, Edit2, Save, X, Camera } from 'lucide-react';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', dob: '', profilePicture: '' });
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          profilePicture: data.profilePicture || ''
        });
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.token]);

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
      if (user.profilePicture !== data.profilePicture || user.name !== data.name) {
        updateUser({ ...user, name: data.name, profilePicture: data.profilePicture });
      }
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading || !profile) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="dashboard-header">
          <div>
            <h1>My Profile</h1>
            <p className="subtitle">Manage your personal information.</p>
          </div>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>

        <div className="glass-card stack-on-mobile" style={{ maxWidth: '800px', margin: '0 auto', gap: '32px', padding: '32px' }}>
          <div className="avatar" style={{ 
            width: '120px', height: '120px', fontSize: '3rem', background: 'var(--interactive)', 
            color: profile.profilePicture ? 'transparent' : 'white', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            backgroundImage: profile.profilePicture ? `url(${profile.profilePicture})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden'
          }}>
            {!profile.profilePicture && profile.name.charAt(0)}
          </div>
          <div style={{ flex: '1' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{profile.name}</h2>
            <span className="badge badge-success">{profile.role}</span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="glass-card profile-grid mt-4" style={{ maxWidth: '800px', margin: '32px auto' }}>
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

        <div className="grid-cards mt-4" style={{ maxWidth: '800px', margin: '32px auto' }}>
          <div className="glass-card">
            <h3 className="cursive-accent">Contact Information</h3>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Mail className="text-muted" size={20} />
                <span>{profile.email}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone className="text-muted" size={20} />
                <span>{profile.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="cursive-accent" style={{ color: '#c9a882' }}>Academic Details</h3>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Hash className="text-muted" size={20} />
                <span>{profile.usnOrEmpId}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Building className="text-muted" size={20} />
                <span>{profile.department || 'Computer Science'}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Calendar className="text-muted" size={20} />
                <span>DOB: {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default StudentProfile;
