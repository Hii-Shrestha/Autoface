import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherSetup from './components/Teacher/TeacherSetup';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<LandingPage />} />
          {/* Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Fixed Path: Iska naam exactly wahi rakha jo Login.jsx mein hai */}
          <Route path="/setup-profile" element={<ProfileSetup />} /> 
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-setup" element={<TeacherSetup />} />

          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;