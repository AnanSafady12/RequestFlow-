import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut, User, Check, X } from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const socket = useSocket();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(err => console.error('Failed to load notifications', err));
    }
  }, [user]);

  // Listen to live socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      // Add to dropdown list
      setNotifications(prev => [notification, ...prev]);
      
      // Trigger toast
      addToast(notification.message, 'info');
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, addToast]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

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
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground relative transition-all duration-200"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 min-w-4 h-4 flex items-center justify-center bg-destructive text-[10px] font-bold text-white rounded-full px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute top-full mt-2 right-0 w-80 max-h-[28rem] overflow-y-auto bg-card border border-border/80 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-top-4 z-50">
                <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border/50 flex items-center justify-between z-10">
                  <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-border/30">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="mx-auto mb-2 opacity-20" size={24} />
                      <p className="text-xs">No notifications yet.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 flex gap-3 transition-colors ${n.isRead ? 'opacity-70' : 'bg-primary/5'}`}
                      >
                        <div className="flex-1 space-y-1">
                          <p className={`text-xs ${!n.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.isRead && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="text-primary p-1 hover:bg-primary/10 rounded-full h-fit flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
