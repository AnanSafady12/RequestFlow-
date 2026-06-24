import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  Send, 
  User, 
  Download, 
  Paperclip, 
  Activity,
  MessageSquare,
  Shield,
  Calendar,
  Lock,
  FileText
} from 'lucide-react';

export default function SupportRequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Management states
  const [agents, setAgents] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Fetch request data, comments, activities and agents list on load
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, commentsRes, activityRes, agentsRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/requests/${id}/comments`),
        api.get(`/requests/${id}/activity`),
        api.get(`/dashboard/satisfaction`) // Use this endpoint to get all support agents
      ]);

      setRequest(reqRes.data);
      setComments(commentsRes.data);
      setActivities(activityRes.data);
      setAgents(agentsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Combine comments and activities chronologically
  const getTimeline = () => {
    const items = [
      ...comments.map(c => ({ ...c, timelineType: 'comment' })),
      ...activities.map(a => ({ ...a, timelineType: 'activity' }))
    ];
    return items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    setError('');

    try {
      const response = await api.post(`/requests/${id}/comments`, {
        content: newComment.trim(),
        isInternal
      });
      // Append the comment to state
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdate = async (field, value) => {
    setUpdating(true);
    setError('');
    
    try {
      const payload = { [field]: value };
      
      // If assignment is cleared, pass null
      if (field === 'assignedToId' && value === '') {
        payload[field] = null;
      }
      
      const res = await api.patch(`/requests/${id}`, payload);
      setRequest(res.data);
      
      // Fetch fresh activities after update
      const actRes = await api.get(`/requests/${id}/activity`);
      setActivities(actRes.data);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to update ${field}.`);
    } finally {
      setUpdating(false);
    }
  };

  // Helper styles for priority and status
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm">Loading request workspace...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="space-y-4">
        <Link to="/support/requests" className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground font-semibold">
          <ArrowLeft size={14} />
          <span>Back to Requests</span>
        </Link>
        <div className="p-6 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm max-w-xl">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const timeline = getTimeline();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header breadcrumb */}
      <div>
        <Link 
          to="/support/requests" 
          className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to All Requests</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {request.title}
            </h1>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1.5">
              <span className="font-mono bg-secondary px-2 py-0.5 rounded-lg">ID: #{request.id.substring(0, 8)}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>Opened {new Date(request.createdAt).toLocaleDateString()}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 font-medium text-foreground">
                <User size={12} />
                <span>Student: {request.student?.name} ({request.student?.email})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {request.isSlaBreached && (
              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-red-500/10 text-red-600 border border-red-500/20">
                SLA BREACHED
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Description, Attachments, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue description card */}
          <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-4 border-l-4 border-l-primary">
            <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
              <FileText size={16} className="text-primary" />
              <span>Issue Description</span>
            </div>
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Attachments ({request.attachments.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {request.attachments.map((file) => (
                    <a 
                      key={file.id}
                      href={`http://localhost:3000/uploads/${file.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-secondary/20 hover:bg-secondary/45 border border-border/60 rounded-2xl transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3 text-xs overflow-hidden">
                        <Paperclip size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-semibold text-foreground truncate">{file.originalName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Download size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unified Timeline section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-foreground flex items-center space-x-2">
              <MessageSquare size={18} className="text-primary" />
              <span>Conversation & Updates</span>
            </h3>

            {/* Feed timeline box */}
            <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-6 max-h-[600px] overflow-y-auto">
              {timeline.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">No activity logs or comments recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4 relative">
                  {/* Vertical rule line in background */}
                  <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-border/40 pointer-events-none hidden md:block"></div>

                  {timeline.map((item, idx) => {
                    if (item.timelineType === 'activity') {
                      return (
                        <div key={`act-${item.id || idx}`} className="flex items-start md:space-x-4 space-y-1 md:space-y-0 text-xs">
                          {/* Left icon circle for system log */}
                          <div className="w-5 h-5 rounded-full bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0 md:ml-3.5 z-10 border border-border/80">
                            <Activity size={10} />
                          </div>
                          <div className="flex-1 bg-secondary/10 px-4 py-2 border border-border/20 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between">
                            <span className="text-muted-foreground italic font-medium leading-relaxed">
                              {item.description}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 md:mt-0 font-medium">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Comment item
                    const isSelf = item.authorId === user?.id;
                    const isInternalNote = item.isInternal;
                    const authorName = item.author?.name || 'Anonymous';
                    const authorRole = item.author?.role || 'STUDENT';

                    return (
                      <div 
                        key={`com-${item.id || idx}`} 
                        className={`flex flex-col space-y-1.5 max-w-[85%] relative z-10 ${
                          isSelf ? 'ml-auto items-end' : 'mr-auto items-start md:ml-12'
                        }`}
                      >
                        {/* Author info header */}
                        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground px-2">
                          <span className="font-bold text-foreground">{authorName}</span>
                          <span className="text-[10px] opacity-75">({authorRole})</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isInternalNote && (
                            <>
                              <span>•</span>
                              <span className="text-amber-500 font-bold flex items-center space-x-1">
                                <Lock size={10} />
                                <span>INTERNAL</span>
                              </span>
                            </>
                          )}
                        </div>

                        {/* Comment message card */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isSelf && !isInternalNote
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : isSelf && isInternalNote
                            ? 'bg-amber-500/20 text-amber-900 dark:text-amber-100 border border-amber-500/40 rounded-tr-none'
                            : isInternalNote
                            ? 'bg-amber-500/10 text-amber-900 dark:text-amber-100 border border-amber-500/30 rounded-tl-none'
                            : 'bg-secondary/40 border border-border/60 text-foreground rounded-tl-none'
                        }`}>
                          {item.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comment Post Box Form */}
            <form onSubmit={handlePostComment} className="flex flex-col space-y-3 p-4 bg-card/45 border border-border/60 rounded-3xl shadow-sm">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Type a response or add a note..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  className="flex-1 px-4 py-3 bg-secondary/35 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl text-sm outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="py-3 px-6 bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-150 flex-shrink-0"
                >
                  {submittingComment ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Send</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2 px-2">
                <input 
                  type="checkbox" 
                  id="internal-note" 
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                />
                <label htmlFor="internal-note" className="text-sm text-muted-foreground flex items-center cursor-pointer">
                  <Lock size={14} className="mr-1.5 text-amber-500" />
                  Mark as Internal Note (hidden from student)
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Management Panel */}
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-6">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider pb-2 border-b border-border/40 flex items-center space-x-2">
              <Shield size={16} className="text-primary" />
              <span>Management Controls</span>
            </h4>
            
            <div className="space-y-5">
              {/* Category (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Category</label>
                <div className="px-3 py-2 bg-secondary/20 border border-border/40 rounded-xl text-sm font-medium">
                  {request.category}
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Status</label>
                <select 
                  value={request.status}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                  disabled={updating}
                  className={`w-full px-3 py-2.5 bg-secondary/35 border rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer ${getStatusStyle(request.status)}`}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              {/* Priority Update */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Priority</label>
                <select 
                  value={request.priority}
                  onChange={(e) => handleUpdate('priority', e.target.value)}
                  disabled={updating}
                  className={`w-full px-3 py-2.5 bg-secondary/35 border rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer ${getPriorityStyle(request.priority)}`}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              {/* Assignee Update */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assignee</label>
                <select 
                  value={request.assignedToId || ''}
                  onChange={(e) => handleUpdate('assignedToId', e.target.value)}
                  disabled={updating}
                  className="w-full px-3 py-2.5 bg-secondary/35 border border-border/80 rounded-xl text-sm font-medium outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} {agent.id === user?.id ? '(Me)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {updating && (
                <div className="flex items-center justify-center space-x-2 text-xs text-primary font-medium">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating request...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Assign to me Quick Action */}
          {!request.assignedToId && (
             <button 
                onClick={() => handleUpdate('assignedToId', user.id)}
                disabled={updating}
                className="w-full py-3 px-4 bg-secondary border border-border/60 hover:border-primary/50 text-foreground hover:text-primary rounded-2xl font-medium text-sm transition-all shadow-sm flex justify-center items-center space-x-2"
              >
                <User size={16} />
                <span>Assign to me</span>
             </button>
          )}

          {/* Student Satisfaction Rating */}
          {(request.status === 'RESOLVED' || request.status === 'CLOSED') && request.rating && (
            <div className="glass-panel p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30 shadow-sm text-center">
              <h4 className="font-bold text-xs text-amber-700 dark:text-amber-500 uppercase tracking-wider mb-2">
                Student Feedback
              </h4>
              <div className="flex justify-center text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={i < request.rating ? 'currentColor' : 'none'} 
                    className="stroke-current" 
                  />
                ))}
              </div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-500">
                {request.rating} / 5 Stars
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
