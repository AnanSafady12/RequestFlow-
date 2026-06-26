import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, FileText, Trash2, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [usersRes, requestsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/requests'),
      ]);
      setUsers(usersRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${name}?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      addToast('User deleted successfully', 'success');
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete user', 'error');
    }
  };

  const handleDeleteRequest = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete request: "${title}"?`)) return;
    try {
      await api.delete(`/admin/requests/${id}`);
      addToast('Request deleted successfully', 'success');
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      addToast('Failed to delete request', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center text-red-600 dark:text-red-400">
          <ShieldAlert className="w-8 h-8 mr-3" />
          System Administration
        </h1>
        <p className="text-muted-foreground mt-1">
          Superuser access. Actions taken here are permanent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management Section */}
        <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-indigo-50/30 dark:bg-indigo-500/10">
            <h2 className="text-lg font-semibold flex items-center text-indigo-700 dark:text-indigo-400">
              <Users className="w-5 h-5 mr-2" />
              Manage Users ({users.length})
            </h2>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[600px]">
            {users.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No users found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name/Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          u.role === 'SUPPORT' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Request Management Section */}
        <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-orange-50/30 dark:bg-orange-500/10">
            <h2 className="text-lg font-semibold flex items-center text-orange-700 dark:text-orange-400">
              <FileText className="w-5 h-5 mr-2" />
              Manage All Requests ({requests.length})
            </h2>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[600px]">
            {requests.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No requests found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title/Student</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground truncate max-w-[200px]" title={r.title}>{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.student?.name || 'Unknown User'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium uppercase">{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteRequest(r.id, r.title)}
                          className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
