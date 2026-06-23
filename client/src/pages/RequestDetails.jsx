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
  Star,
  Activity,
  MessageSquare,
  Shield,
  Calendar,
  Lock,
  FileText
} from 'lucide-react';

export default function RequestDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Rating states
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Fetch request data, comments, and activities on load
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, commentsRes, activityRes] = await Promise.all([
        api.get(`/requests/${id}`),
        api.get(`/requests/${id}/comments`),
        api.get(`/requests/${id}/activity`)
      ]);

      setRequest(reqRes.data);
      setComments(commentsRes.data);
      setActivities(activityRes.data);
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
        isInternal: false // students can only add public comments
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

  const handleSubmitRating = async (ratingVal) => {
    setSubmittingRating(true);
    setRatingError('');

    try {
      await api.post(`/requests/${id}/rate`, { rating: ratingVal });
      // Update request state with new rating
      setRequest({ ...request, rating: ratingVal });
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
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
        <Link to="/student/requests" className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground font-semibold">
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
          to="/student/requests" 
          className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to My Requests</span>
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
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${getPriorityStyle(request.priority)}`}>
              {request.priority} Priority
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${getStatusStyle(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Description, Attachments, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue description card */}
          <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-4">
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
            <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-6 max-h-[500px] overflow-y-auto">
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
                    const authorName = item.author?.name || 'Anonymous';
                    const authorRole = item.author?.role || 'STUDENT';

                    return (
                      <div 
                        key={`com-${item.id || idx}`} 
                        className={`flex flex-col space-y-1.5 max-w-[85%] ${
                          isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        {/* Author info header */}
                        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground px-2">
                          <span className="font-bold text-foreground">{authorName}</span>
                          <span className="text-[10px] opacity-75">({authorRole})</span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Comment message card */}
                        <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isSelf 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
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
            {request.status !== 'CLOSED' && (
              <form onSubmit={handlePostComment} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Ask a question or add details..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  className="flex-1 px-4 py-3 bg-secondary/35 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-2xl text-sm outline-none transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="py-3 px-5 bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-150 flex-shrink-0"
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
              </form>
            )}
          </div>
        </div>

        {/* Right Side: Metadata, Assignee, Rating Panel */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-foreground uppercase tracking-wider pb-2 border-b border-border/40">
              Request Details
            </h4>
            
            <div className="space-y-3.5 text-xs">
              {/* Category */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Category</span>
                <span className="font-bold text-foreground">{request.category}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="font-bold text-foreground flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${
                    request.status === 'RESOLVED' ? 'bg-emerald-500' : request.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-400'
                  }`}></span>
                  <span>{request.status}</span>
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Urgency</span>
                <span className="font-bold text-foreground">{request.priority}</span>
              </div>

              {/* Assignee Details */}
              <div className="pt-3.5 border-t border-border/40 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Assigned Agent
                </span>
                
                {request.assignedTo ? (
                  <div className="flex items-center space-x-3 p-2 bg-secondary/20 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold">
                      {request.assignedTo.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-foreground truncate">{request.assignedTo.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{request.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Unassigned — Awaiting agent reviews</p>
                )}
              </div>
            </div>
          </div>

          {/* Rating / Feedback Panel */}
          {(request.status === 'RESOLVED' || request.status === 'CLOSED') && (
            <div className="glass-panel p-6 rounded-3xl bg-card/45 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider pb-2 border-b border-border/40">
                Rate Your Experience
              </h4>

              {ratingError && (
                <div className="p-3 bg-destructive/15 border border-destructive/30 rounded-xl flex items-start space-x-2 text-destructive text-xs">
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={14} />
                  <span>{ratingError}</span>
                </div>
              )}

              {request.rating ? (
                // Rating already submitted
                <div className="text-center py-4 space-y-2">
                  <div className="flex items-center justify-center space-x-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={24} 
                        fill={i < request.rating ? 'currentColor' : 'none'} 
                        className="stroke-current" 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Thank you! You rated this support {request.rating} out of 5 stars.
                  </p>
                </div>
              ) : (
                // Rate interactive form
                <div className="text-center space-y-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    This request has been resolved. Please take a moment to rate the service received:
                  </p>
                  
                  <div className="flex items-center justify-center space-x-1.5 text-slate-300 dark:text-slate-700">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={submittingRating}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleSubmitRating(star)}
                        className={`transition-colors duration-150 p-1 hover:scale-110 active:scale-95 disabled:scale-100 ${
                          (hoveredRating || 0) >= star
                            ? 'text-amber-400'
                            : 'hover:text-amber-400'
                        }`}
                      >
                        <Star 
                          size={28} 
                          fill={(hoveredRating || 0) >= star ? 'currentColor' : 'none'} 
                          className="stroke-current" 
                        />
                      </button>
                    ))}
                  </div>
                  
                  {submittingRating && (
                    <div className="text-[10px] text-primary animate-pulse font-medium">Submitting rating...</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
