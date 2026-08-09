import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard, User, Bell } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import './Layout.css';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const getLinks = () => {
    switch (user?.role) {
      case 'Student':
        return [
          { to: '/student-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
          { to: '/student-profile', icon: <User size={18} />, label: 'Profile' },
          { to: '/student-attendance', icon: <BookOpen size={18} />, label: 'Attendance' },
        ];
      case 'Faculty':
        return [
          { to: '/faculty-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
          { to: '/faculty-profile', icon: <User size={18} />, label: 'Profile' },
        ];
      case 'HOD':
        return [
          { to: '/hod-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
          { to: '/hod-profile', icon: <User size={18} />, label: 'Profile' },
        ];
      case 'Admin':
        return [
          { to: '/admin-dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        ];
      default:
        return [];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <div className="floating-header-container">
        <motion.header 
          className="floating-header"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <NavLink to={`/${user?.role?.toLowerCase()}-dashboard`} className="header-brand">
            <BookOpen className="brand-icon" size={28} />
            <h2>CSARMS</h2>
          </NavLink>
          
          <nav className="header-nav">
            {getLinks().map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <Bell size={22} />
              {/* <span className="notification-badge">3</span> */}
            </button>
            <button className="icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={22} />
            </button>
          </div>
        </motion.header>
      </div>

      <AnimatePresence>
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
