import { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { User as UserIcon, Clock, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';



interface Log {
  _id: string;
  user: { username: string; email: string; role: string };
  action: string;
  module: string;
  details?: string;
  timestamp: string;
}

export default function Activities() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/activities?limit=50');
        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">System Activities</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Audit logs of all system operations</p>
        </div>
        
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter Logs
          </Button>
        
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Operation</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Module</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-secondary-400 animate-pulse font-bold">Fetching system logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-secondary-500 italic">No activities recorded yet.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="table-row group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-secondary-900 dark:text-white">{log.user?.username || 'System'}</p>
                          <p className="text-xs text-secondary-400 font-medium">{log.user?.role || 'Service'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-secondary-700 dark:text-secondary-300">{log.action}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{log.module}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-secondary-500 font-medium max-w-xs truncate" title={log.details}>
                        {log.details || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs font-bold text-secondary-400">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                        <span className="ml-1 opacity-60">{format(new Date(log.timestamp), 'MMM dd')}</span>
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
