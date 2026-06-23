import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  PlusCircle, 
  X,
  AlertCircle
} from 'lucide-react';

export default function StudentRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        // Build query string based on selected filter values
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (categoryFilter) params.category = categoryFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (searchTerm) params.search = searchTerm;

        const response = await api.get('/requests', { params });
        setRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to retrieve support requests.');
      } finally {
        setLoading(false);
      }
    }

    // Debounce the search term to prevent rapid API calls
    const delayDebounce = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setPriorityFilter('');
  };

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
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            My Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and filter all your past and current support requests.
          </p>
        </div>
        <Link 
          to="/student/requests/new" 
          className="inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-2xl text-sm transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-primary/20 scale-[1.01] hover:scale-[1.02]"
        >
          <PlusCircle size={16} />
          <span>New Request</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl bg-card/45 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/35 border border-border/80 rounded-2xl text-xs outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/35 border border-border/80 rounded-2xl text-xs outline-none focus:border-primary appearance-none cursor-pointer text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/35 border border-border/80 rounded-2xl text-xs outline-none focus:border-primary appearance-none cursor-pointer text-foreground"
            >
              <option value="">All Categories</option>
              <option value="ADMIN">Academic Admin</option>
              <option value="FINANCIAL">Financial Holds</option>
              <option value="EXAMS">Exams Holds</option>
              <option value="ENGLISH_DEPARTMENT">English Department</option>
              <option value="MEDICAL_APPROVAL">Medical Leave</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/35 border border-border/80 rounded-2xl text-xs outline-none focus:border-primary appearance-none cursor-pointer text-foreground"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Clear filters label */}
        {(searchTerm || statusFilter || categoryFilter || priorityFilter) && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              Showing {requests.length} matching result{requests.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={resetFilters}
              className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
            >
              <X size={12} />
              <span>Clear Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Requests table container */}
      <div className="glass-panel rounded-3xl bg-card/45 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground text-xs">Fetching support requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <HelpCircle className="text-muted-foreground/60 mx-auto mb-3" size={36} />
              <p className="text-foreground font-semibold text-sm">No requests found</p>
              <p className="text-muted-foreground text-xs mt-1 max-w-xs mx-auto">
                We couldn't find any support requests matching your filter selections.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-secondary/20">
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {requests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => navigate(`/student/requests/${req.id}`)}
                    className="hover:bg-secondary/20 cursor-pointer transition-colors duration-150 group"
                  >
                    {/* Request ID */}
                    <td className="px-6 py-4 font-mono text-[11px] text-muted-foreground">
                      #{req.id.substring(0, 8)}
                    </td>

                    {/* Title & CreatedAt */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {req.title}
                        </span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          Submitted on {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-xs font-medium text-foreground">
                      {req.category}
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getPriorityStyle(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </td>

                    {/* View link action */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-muted-foreground hover:text-primary p-1 rounded-lg hover:bg-secondary/50 transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
