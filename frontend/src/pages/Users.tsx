import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * User Management Page.
 * Simplified for a single-admin system to manage user access status.
 */
export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user: any) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">System Users</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Manage user access and account status</p>
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Account Status</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }} />
                      <p className="font-bold text-secondary-400">Syncing user database...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="table-row group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-secondary-900 dark:text-white">{user.username}</p>
                          <p className="text-xs font-medium text-secondary-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <div className="flex items-center gap-1.5 text-status-success text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active Access
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-status-error text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Access Revoked
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondary-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant={user.isActive ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => toggleStatus(user)}
                          className={user.isActive ? 'text-status-error border-status-error/20' : 'text-status-success border-status-success/20'}
                        >
                          {user.isActive ? 'Revoke Access' : 'Grant Access'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

