import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentAttendance from './pages/StudentAttendance';
import FacultyDashboard from './pages/FacultyDashboard';
import StaffProfile from './pages/StaffProfile';
import HodDashboard from './pages/HodDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SplashScreen from './components/SplashScreen';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    if (user.role === 'Student') return <Navigate to="/student-dashboard" replace />;
    if (user.role === 'Faculty') return <Navigate to="/faculty-dashboard" replace />;
    if (user.role === 'HOD') return <Navigate to="/hod-dashboard" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

const BackgroundBlobs = () => (
  <div className="background-blobs">
    <div className="blob blob-1"></div>
    <div className="blob blob-2"></div>
    <div className="blob blob-3"></div>
    <div className="blob blob-4"></div>
    <div className="blob blob-5"></div>
  </div>
);

function App() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BackgroundBlobs />
      <div className="app-container" style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to={`/${user.role.toLowerCase()}-dashboard`} replace /> : <LoginPage />} />
          
          <Route path="/student-dashboard" element={<ProtectedRoute role="Student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student-profile" element={<ProtectedRoute role="Student"><StudentProfile /></ProtectedRoute>} />
          <Route path="/student-attendance" element={<ProtectedRoute role="Student"><StudentAttendance /></ProtectedRoute>} />
          <Route path="/faculty/:id" element={<ProtectedRoute role="Student"><StaffProfile /></ProtectedRoute>} />
          
          <Route path="/faculty-dashboard" element={<ProtectedRoute role="Faculty"><FacultyDashboard /></ProtectedRoute>} />
          <Route path="/faculty-profile" element={<ProtectedRoute role="Faculty"><StaffProfile /></ProtectedRoute>} />
          
          <Route path="/hod-dashboard" element={<ProtectedRoute role="HOD"><HodDashboard /></ProtectedRoute>} />
          <Route path="/hod-profile" element={<ProtectedRoute role="HOD"><StaffProfile /></ProtectedRoute>} />

          <Route path="/admin-dashboard" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
