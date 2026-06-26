import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, Users, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isStudent = user.role === 'STUDENT';
  const isAdmin = user.role === 'ADMIN';

  // Active link styling helper
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`;

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/auth/me');
        logout();
        navigate('/login');
      } catch (err) {
        console.error('Failed to delete account', err);
        alert('An error occurred while deleting your account.');
      }
    }
  };

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-30 hidden w-64 border-r border-border bg-card/50 backdrop-blur-md md:block">
      <div className="flex h-full flex-col px-4 py-6 justify-between">
        {/* Navigation Section */}
        <div className="space-y-2">
          <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-4">
            Navigation
          </p>
          
          {isAdmin ? (
            <>
              {/* Admin links */}
              <NavLink to="/admin" end className={linkClass}>
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </NavLink>
            </>
          ) : isStudent ? (
            <>
              {/* Student links */}
              <NavLink to="/student" end className={linkClass}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/student/requests" end className={linkClass}>
                <FileText size={18} />
                <span>My Requests</span>
              </NavLink>
              
              <NavLink to="/student/requests/new" className={linkClass}>
                <PlusCircle size={18} />
                <span>New Request</span>
              </NavLink>
            </>
          ) : (
            <>
              {/* Support links */}
              <NavLink to="/support" end className={linkClass}>
                <LayoutDashboard size={18} />
                <span>Analytics Dashboard</span>
              </NavLink>
              
              <NavLink to="/support/requests" className={linkClass}>
                <FileText size={18} />
                <span>All Requests</span>
              </NavLink>
            </>
          )}
        </div>

        {/* User Card Widget inside Sidebar */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/40 rounded-2xl border border-border/50">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                {user.role.charAt(0)}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">{user.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize mt-0.5 leading-none">
                  Role: {user.role.toLowerCase()}
                </span>
              </div>
            </div>
            
            {user.role !== 'ADMIN' && (
              <button
                onClick={handleDeleteAccount}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                title="Delete Account"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
