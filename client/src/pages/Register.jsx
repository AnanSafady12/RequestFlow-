import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-md p-8 rounded-2xl border border-border/80 shadow-2xl flex flex-col items-center">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-muted-foreground text-sm mb-6 text-center">
          RequestFlow Student & Support Portal
        </p>
        <div className="w-full p-4 bg-secondary/50 rounded-xl border border-border/50 text-center mb-6 text-sm text-muted-foreground">
          🎓 [Stage 10 Auth UI Placeholder]
        </div>
        <Link to="/login" className="text-primary hover:underline text-sm font-medium">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
