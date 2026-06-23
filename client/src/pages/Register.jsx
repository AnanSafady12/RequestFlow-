import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertTriangle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // default role is STUDENT
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      // Automatically redirect to the verify email page, passing the email in the query params
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            RequestFlow
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            College Student & Support Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/15 border border-destructive/30 rounded-2xl flex items-start space-x-3 text-destructive text-sm">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Panel */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl bg-card/60">
          <h2 className="text-2xl font-bold mb-6 text-foreground text-center">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="•••••••• (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Premium Role Card Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Account Type / Role
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* Student Option Card */}
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  disabled={loading}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                    role === 'STUDENT'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-secondary/20 hover:text-foreground'
                  }`}
                >
                  <UserCheck size={20} className={role === 'STUDENT' ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="mt-2">
                    <p className="text-xs font-bold leading-none">Student</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Submit & track requests</p>
                  </div>
                </button>

                {/* Support Option Card */}
                <button
                  type="button"
                  onClick={() => setRole('SUPPORT')}
                  disabled={loading}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 ${
                    role === 'SUPPORT'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-transparent text-muted-foreground hover:bg-secondary/20 hover:text-foreground'
                  }`}
                >
                  <ShieldAlert size={20} className={role === 'SUPPORT' ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="mt-2">
                    <p className="text-xs font-bold leading-none">Support Staff</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Manage & assign tickets</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/20 scale-[1.01] hover:scale-[1.02] active:scale-[0.99] disabled:scale-100 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
