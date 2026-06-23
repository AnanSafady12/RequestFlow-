import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  // 1. Session restoration loader (premium micro-animation)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">
          Restoring secure session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Unauthorized role redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Fallback path based on role
    const fallbackPath = user.role === 'SUPPORT' ? '/support' : '/student';
    return <Navigate to={fallbackPath} replace />;
  }

  // 4. Access granted
  return <Outlet />;
}
