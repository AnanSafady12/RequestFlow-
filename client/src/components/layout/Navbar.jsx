import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Sync dark mode class with DOM and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-6 flex items-center justify-between text-foreground">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent tracking-tight">
          RequestFlow <span className="text-xs font-semibold text-muted-foreground uppercase">Portal</span>
        </span>
      </Link>

      {/* Right Navigation controls */}
      <div className="flex items-center space-x-4">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-200"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>

        {/* Notification Bell */}
        {user && (
          <button 
            onClick={() => alert("Notifications center will be implemented soon!")}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-all duration-200"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full status-indicator-pulse"></span>
          </button>
        )}

        {/* User profile dropdown info */}
        {user && (
          <div className="flex items-center space-x-3 border-l border-border pl-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1 capitalize leading-none">
                {user.role.toLowerCase()}
              </span>
            </div>
            
            {/* Avatar Circle */}
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              title="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
