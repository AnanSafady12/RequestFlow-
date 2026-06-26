import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Clock,
  AlertTriangle,
  CheckCircle,
  Inbox,
  Star,
  Users,
  AlertCircle,
  Wifi
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [slaBreaches, setSlaBreaches] = useState([]);
  const [agentSatisfaction, setAgentSatisfaction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time state
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Socket listener for online users
  useEffect(() => {
    if (!socket) return;

    socket.on('users:online', (payload) => {
      // payload is { support: [], students: [], totalOnline: N }
      const combined = [...(payload.support || []), ...(payload.students || [])];
      setOnlineUsers(combined);
    });

    return () => {
      socket.off('users:online');
    };
  }, [socket]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, slaRes, satRes] = await Promise.all([
          axios.get('http://localhost:3000/api/dashboard/stats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:3000/api/dashboard/sla-breaches', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:3000/api/dashboard/satisfaction', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);
        
        setStats(statsRes.data);
        setSlaBreaches(slaRes.data);
        setAgentSatisfaction(satRes.data);
      } catch (err) {
        setError('Failed to load dashboard analytics. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Support Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}. Here is the current system status.
          </p>
        </div>
        <Link
          to="/support/requests"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View All Requests
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
            <h3 className="text-2xl font-bold">{stats.totalRequests}</h3>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Open & In Progress</p>
            <h3 className="text-2xl font-bold">{stats.openRequests + stats.inProgressRequests}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">SLA Breaches</p>
            <h3 className="text-2xl font-bold">{stats.slaBreaches}</h3>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center space-x-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resolved</p>
            <h3 className="text-2xl font-bold">{stats.resolvedRequests + stats.closedRequests}</h3>
          </div>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold">{stats.avgResponseTime} hours</h4>
          <p className="text-muted-foreground text-sm">Average Response Time</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold">{stats.avgSatisfaction} / 5</h4>
          <p className="text-muted-foreground text-sm">Average Satisfaction Rating</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4">
            <BarChart className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold">{stats.topCategory}</h4>
          <p className="text-muted-foreground text-sm">Most Requested Category</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Online Users */}
        <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col lg:col-span-1">
          <div className="p-6 border-b border-border bg-emerald-50/30 dark:bg-emerald-500/10">
            <h2 className="text-lg font-semibold flex items-center text-emerald-700 dark:text-emerald-400">
              <Wifi className="w-5 h-5 mr-2 animate-pulse" />
              Live Online Users ({onlineUsers.length})
            </h2>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-96">
            {onlineUsers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Connecting to live tracker...
              </div>
            ) : (
              <div className="divide-y divide-border">
                {onlineUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <div>
                      <p className="text-sm font-semibold">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SLA Breaches List */}
        <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col lg:col-span-1">
          <div className="p-6 border-b border-border bg-red-50/30 dark:bg-red-500/10">
            <h2 className="text-lg font-semibold flex items-center text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              SLA Breached Tickets
            </h2>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-96">
            {slaBreaches.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No active SLA breaches. Great job!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {slaBreaches.map((req) => (
                  <Link 
                    key={req.id} 
                    to={`/support/requests/${req.id}`}
                    className="block p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm truncate pr-4">{req.title}</span>
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium whitespace-nowrap">
                        Overdue
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>{req.student?.name || 'Unknown'}</span>
                      <span>Priority: {req.priority}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agent Satisfaction Table */}
        <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col lg:col-span-1">
          <div className="p-6 border-b border-border bg-orange-50/30 dark:bg-orange-500/10">
            <h2 className="text-lg font-semibold flex items-center text-orange-700 dark:text-orange-400">
              <Users className="w-5 h-5 mr-2" />
              Agent Satisfaction Matrix
            </h2>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-96">
            {agentSatisfaction.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No agent ratings available yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Agent Name</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ratings</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {agentSatisfaction.map((agent) => (
                    <tr key={agent.id} className="hover:bg-muted/30">
                      <td className="px-4 py-4 font-medium">{agent.name}</td>
                      <td className="px-4 py-4 text-center">{agent.totalRatings}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <span className="font-bold mr-1">{agent.averageRating}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
