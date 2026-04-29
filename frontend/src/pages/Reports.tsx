import { useEffect, useState } from 'react';
import { 
  FileText, Download, TrendingUp, Package, 
  ShoppingCart, Activity, ArrowDown, ExternalLink, Loader2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, LineChart, Line 
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';

interface AnalyticsData {
  salesTrend: { month: string; sales: number; orders: number }[];
  productActivity: { category: string; count: number }[];
}

interface DashboardStats {
  totalStockValue: number;
  recentRevenue: number;
}

export default function Reports() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [analyticsRes, dashRes] = await Promise.all([
          api.get('/reports/analytics'),
          api.get('/reports/dashboard')
        ]);
        setAnalytics(analyticsRes.data);
        setStats(dashRes.data);
      } catch (err) {
        console.error('Failed to fetch report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const handleExport = async (type: 'inventory' | 'sales', format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const response = await api.get(`/reports/export/${type}?format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">System Reports</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Analyze your business performance with real data</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Inventory Reports" subtitle="Detailed stock and warehouse data" className="border-none shadow-soft overflow-hidden group">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary transition-transform group-hover:rotate-12">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Valuation</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                ${stats?.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => handleExport('inventory', 'pdf')} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => handleExport('inventory', 'excel')} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </Card>

        <Card title="Sales Reports" subtitle="Order history and revenue tracking" className="border-none shadow-soft overflow-hidden group">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-status-success/10 text-status-success transition-transform group-hover:rotate-12">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Recent Revenue (7d)</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                ${stats?.recentRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={() => handleExport('sales', 'pdf')} disabled={exporting}>
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => handleExport('sales', 'excel')} disabled={exporting}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Sales Trend" subtitle="Revenue growth over last 30 days" className="border-none shadow-soft h-[400px]">
          <div className="h-full mt-4">
            {!analytics || analytics.salesTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary-400 italic">No sales data available for charts</div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={analytics.salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b67f5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b67f5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b67f5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Operational Performance" subtitle="Orders vs Product Activity" className="border-none shadow-soft h-[400px]">
          <div className="h-full mt-4">
            {!analytics || analytics.salesTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary-400 italic">No operational data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={analytics.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Insights List */}
      <Card title="Quick Activity Insights" subtitle="Real system milestones" className="border-none shadow-soft">
        <div className="space-y-6">
          {!analytics || analytics.productActivity.length === 0 ? (
            <p className="text-center py-8 text-secondary-400 italic">No activity insights yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.productActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 hover:bg-white dark:hover:bg-secondary-800 transition-all border border-transparent hover:border-secondary-100 dark:hover:border-secondary-700">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-secondary-700 shadow-sm text-primary">
                      <Package className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-secondary-600 dark:text-secondary-400">{activity.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-secondary-900 dark:text-white">{activity.count} Products</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
