import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState({ expired: false, verified: false });

  // Check URL query parameters for redirect notifications on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBanners({
      expired: params.get('expired') === 'true',
      verified: params.get('verified') === 'true',
    });
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    // Dismiss redirect banners when submitting
    setBanners({ expired: false, verified: false });

    try {
      const loggedUser = await login(email, password);
      // Redirect based on user role
      if (loggedUser.role === 'SUPPORT') {
        navigate('/support');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background design elements (Decorative glow circles) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md animate-fade-in z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            RequestFlow
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            College Student Support Portal
          </p>
        </div>

        {/* Info Banners */}
        {banners.expired && (
          <div className="mb-4 p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start space-x-3 text-amber-600 dark:text-amber-400 text-sm">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {banners.verified && (
          <div className="mb-4 p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start space-x-3 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
            <span>Email verified successfully! You can now log in.</span>
          </div>
        )}

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
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
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
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/20 scale-[1.01] hover:scale-[1.02] active:scale-[0.99] disabled:scale-100 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
