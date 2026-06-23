import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-md p-8 rounded-2xl border border-border shadow-xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-destructive">403 - Access Denied</h2>
        <p className="text-muted-foreground text-sm text-center mt-2">
          You do not have permissions to view this resource.
        </p>
        <Link 
          to="/" 
          className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-all text-sm font-semibold shadow-lg shadow-primary/10"
        >
          Return to Portal Home
        </Link>
      </div>
    </div>
  );
}
