import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function LayoutWrapper() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Top Fixed Header Navbar */}
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Left Fixed Sidebar Navigation */}
        <Sidebar />

        {/* Responsive Content Area */}
        <main className="flex-1 md:pl-64 min-h-[calc(100vh-4rem)] bg-background/30 transition-all duration-300">
          {/* Inner Content Grid */}
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
