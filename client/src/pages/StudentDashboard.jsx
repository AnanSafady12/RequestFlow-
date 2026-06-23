import React from 'react';

export default function StudentDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
      <div className="p-6 bg-card border border-border/80 rounded-2xl shadow-sm">
        <p className="text-muted-foreground text-sm">
          Welcome to your student workspace! This page will be populated in Stage 11 with metrics and ticket lists.
        </p>
      </div>
    </div>
  );
}
