import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  PlusCircle, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await api.get('/requests');
        setRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  // Compute metrics from the requests array
  const total = requests.length;
  const open = requests.filter(r => r.status === 'OPEN').length;
  const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const resolved = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

  // Grab the 3 most recent requests
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Dynamic priority styles for badges
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
    }
  };

  // Dynamic status styles for badges
  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
      case 'IN_PROGRESS':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          Student Workspace
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor your requests, check reply statuses, and request assistance from departments.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 glass-panel rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Total */}
          <div className="glass-panel p-6 rounded-2xl bg-card/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Requests</p>
              <h2 className="text-3xl font-extrabold mt-1 text-foreground">{total}</h2>
            </div>
            <div className="p-3 bg-secondary/50 rounded-2xl text-muted-foreground">
              <FileText size={24} />
            </div>
          </div>

          {/* Card: Open */}
          <div className="glass-panel p-6 rounded-2xl bg-card/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open</p>
              <h2 className="text-3xl font-extrabold mt-1 text-foreground">{open}</h2>
            </div>
            <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-600 dark:text-slate-400">
              <HelpCircle size={24} />
            </div>
          </div>

          {/* Card: In Progress */}
          <div className="glass-panel p-6 rounded-2xl bg-card/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
              <h2 className="text-3xl font-extrabold mt-1 text-foreground">{inProgress}</h2>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Clock size={24} />
            </div>
          </div>

          {/* Card: Resolved */}
          <div className="glass-panel p-6 rounded-2xl bg-card/40 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
              <h2 className="text-3xl font-extrabold mt-1 text-foreground">{resolved}</h2>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Main split: recent tickets list & quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent tickets panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-card/40 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">Recent Requests</h3>
              <Link to="/student/requests" className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-secondary/30 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">You haven't submitted any support requests yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => (
                  <Link 
                    key={req.id} 
                    to={`/student/requests/${req.id}`}
                    className="flex items-center justify-between p-4 bg-secondary/10 hover:bg-secondary/30 border border-border/40 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {req.title}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px]">{req.id.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>{req.category}</span>
                        <span>•</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getPriorityStyle(req.priority)}`}>
                        {req.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick action cards */}
        <div className="flex flex-col space-y-4">
          <div className="glass-panel p-6 rounded-2xl bg-card/40 flex flex-col justify-between h-full shadow-sm relative overflow-hidden group">
            {/* Ambient background glow inside panel */}
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-300"></div>
            
            <div className="z-10">
              <PlusCircle className="text-primary mb-4" size={32} />
              <h3 className="font-bold text-lg text-foreground">Need Support?</h3>
              <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
                Submit a new request to departments (e.g. exams holds, financial holds, English departments, or medical leaves) for evaluation.
              </p>
            </div>
            
            <Link 
              to="/student/requests/new" 
              className="mt-6 w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all duration-200 z-10"
            >
              <span>Submit Request</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
