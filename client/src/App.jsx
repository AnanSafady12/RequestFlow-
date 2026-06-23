import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutWrapper from './components/layout/LayoutWrapper';

// Page Views
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import StudentDashboard from './pages/StudentDashboard';
import StudentRequests from './pages/StudentRequests';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import SupportDashboard from './pages/SupportDashboard';
import SupportRequests from './pages/SupportRequests';
import Unauthorized from './pages/Unauthorized';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages: If already logged in, redirect straight to role dashboards */}
      <Route 
        path="/login" 
        element={!user ? <Login /> : <Navigate to={user.role === 'SUPPORT' ? '/support' : '/student'} replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register /> : <Navigate to={user.role === 'SUPPORT' ? '/support' : '/student'} replace />} 
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Student Layout Group */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/requests" element={<StudentRequests />} />
          <Route path="/student/requests/new" element={<CreateRequest />} />
          <Route path="/student/requests/:id" element={<RequestDetails />} />
        </Route>
      </Route>

      {/* Protected Support Layout Group */}
      <Route element={<ProtectedRoute allowedRoles={['SUPPORT']} />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="/support/requests" element={<SupportRequests />} />
        </Route>
      </Route>

      {/* Root redirect: redirects to dashboard or login depending on login status */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'SUPPORT' ? '/support' : '/student'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Catch-All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
