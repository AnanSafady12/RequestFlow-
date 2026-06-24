import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  FileText, 
  HelpCircle, 
  Paperclip, 
  AlertTriangle, 
  ArrowLeft, 
  Send,
  Sparkles,
  X,
  UploadCloud
} from 'lucide-react';

export default function CreateRequest() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ADMIN');
  const [priority, setPriority] = useState('HIGH'); // ADMIN is high initially
  const [file, setFile] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    
    // Auto-update priority state based on category
    if (cat === 'ADMIN' || cat === 'FINANCIAL' || cat === 'MEDICAL_APPROVAL') {
      setPriority('HIGH');
    } else if (cat === 'EXAMS') {
      setPriority('MEDIUM');
    } else {
      setPriority('LOW');
    }
  };

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files ? e.target.files[0] : null;
    processFile(selectedFile);
    if (e.target) e.target.value = null; // clear file input
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Verify file size limit (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 5MB limit.');
      setFile(null);
      return;
    }

    // Verify file type (PDF, JPEG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Only JPG, PNG, and PDF files are allowed.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;
    
    setError('');
    const droppedFile = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    processFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Build a Multipart FormData payload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      if (file) {
        formData.append('file', file);
      }

      // Send requests
      const response = await api.post('/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirect student to the newly created request detail view
      const createdRequest = response.data;
      navigate(`/student/requests/${createdRequest.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while creating the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link 
          to="/student" 
          className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          Submit New Request
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Open a new support request. Provide details and any relevant documents to accelerate reviews.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm">
          <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Panel */}
      <div className="glass-panel p-8 rounded-3xl bg-card/45 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Request Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              disabled={loading}
              placeholder="e.g. Hold on course registration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary/35 border border-border/80 rounded-2xl text-sm outline-none focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Department / Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              disabled={loading}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2.5 bg-secondary/35 border border-border/80 rounded-2xl text-sm outline-none focus:border-primary cursor-pointer text-foreground"
            >
              <option value="ADMIN">Academic Admin</option>
              <option value="FINANCIAL">Financial Holds</option>
              <option value="EXAMS">Exams & Grading</option>
              <option value="ENGLISH_DEPARTMENT">English Department</option>
              <option value="MEDICAL_APPROVAL">Medical Leaves</option>
            </select>
          </div>

          {/* Priority auto-display */}
          <div className="flex items-center justify-between p-4 bg-secondary/15 border border-border/80 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Calculated Priority
              </span>
              <p className="text-[10px] text-muted-foreground">
                Priority is auto-assigned based on the category's urgency level.
              </p>
            </div>
            
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${
              priority === 'HIGH'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                : priority === 'MEDIUM'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
            }`}>
              {priority} Priority
            </span>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Describe Your Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={5}
              disabled={loading}
              placeholder="Please provide details about your issue, error codes, steps to reproduce, or support requested..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-secondary/35 border border-border/80 rounded-2xl text-sm outline-none focus:border-primary transition-all duration-200 resize-none leading-relaxed"
            />
          </div>

          {/* Attachment upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Supporting Attachment
            </label>
            
            {!file ? (
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)] scale-[1.02]' 
                    : 'border-border/80 hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20'
                } ${loading ? 'pointer-events-none opacity-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="file-upload"
                  disabled={loading}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center space-y-2 pointer-events-none">
                  <div className={`p-3 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'}`}>
                    <UploadCloud size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      <span className="text-primary hover:underline cursor-pointer">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, PNG, or JPG (max. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground max-w-[200px] sm:max-w-[300px] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  disabled={loading}
                  onClick={() => setFile(null)}
                  className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Remove file"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex items-center space-x-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/95 disabled:bg-primary/50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-primary/20 scale-[1.01] hover:scale-[1.02] active:scale-[0.99] disabled:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Submit Request</span>
                  <Send size={14} />
                </>
              )}
            </button>
            
            <Link 
              to="/student" 
              className="py-3 px-6 border border-border hover:bg-secondary/35 text-foreground font-semibold rounded-2xl text-sm text-center transition-all duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
