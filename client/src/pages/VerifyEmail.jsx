import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const { verifyCode, resendCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Prefill email field from query parameter '?email=...'
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!email || !code) {
      setError('Email and 6-digit verification code are required.');
      return;
    }

    if (code.length !== 6 || isNaN(code)) {
      setError('Verification code must be exactly 6 digits.');
      return;
    }

    setLoading(true);

    try {
      await verifyCode(email, code);
      // Redirect to login page with verified query flag
      navigate('/login?verified=true');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address to resend the code.');
      return;
    }

    setResending(true);

    try {
      const response = await resendCode(email);
      setSuccess(response?.message || 'A new code has been sent to your email.');
    } catch (err) {
      setError(err);
    } finally {
      setResending(false);
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
            Confirm Your Email Address
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start space-x-3 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />
            <span>{success}</span>
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
            Verification
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Registered Email
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
                  disabled={loading || resending}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-sm outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  6-Digit Verification Code
                </label>
                
                {/* Resend Link button */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resending}
                  className="text-xs text-primary font-bold hover:underline flex items-center space-x-1 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                  <span>Resend Code</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <KeyRound size={18} />
                </div>
                <input
                  id="code"
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // only allow numbers
                  disabled={loading || resending}
                  className="w-full pl-10 pr-4 py-3 tracking-[0.5em] font-mono text-center font-bold bg-secondary/30 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-2xl text-lg outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || resending}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 font-semibold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-primary/10 hover:shadow-primary/20 scale-[1.01] hover:scale-[1.02] active:scale-[0.99] disabled:scale-100 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Verify Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-muted-foreground text-sm mt-6">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
