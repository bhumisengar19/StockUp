import { useEffect, useState } from 'react';
import {
  Package, ShoppingCart, AlertTriangle, Clock,
  BarChart2, ArrowUpRight, Plus, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  totalStockValue: number;
  lowStockProducts: { _id: string; productName: string; category: string; quantity: number; lowStockThreshold: number }[];
  categoryStats: { name: string; value: number }[];
}

interface SalesPoint { date: string; sales: number; orders: number }

// Monochrome palette for charts — works in both themes
const CHART_COLORS = [
  'rgba(59,130,246,0.8)',
  'rgba(99,160,255,0.7)',
  'rgba(147,197,253,0.8)',
  'rgba(29,78,216,0.7)',
  'rgba(191,219,254,0.8)',
  'rgba(37,99,235,0.7)',
];

const kpiColors = [
  { icon: 'rgba(59,130,246,0.15)', iconText: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { icon: 'rgba(34,197,94,0.15)',  iconText: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { icon: 'rgba(249,115,22,0.15)', iconText: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { icon: 'rgba(239,68,68,0.15)',  iconText: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
];

export default function Dashboard() {
  const [data,      setData]      = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<SalesPoint[]>([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/orders/analytics'),
        ]);
        setData(dashRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent"
          style={{
            borderColor: '#3b82f6',
            borderTopColor: 'transparent',
            animation: 'spinSlow 1s linear infinite',
          }}
        />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Products',   value: data?.totalProducts  ?? 0, icon: Package,       idx: 0 },
    { label: 'Total Orders',     value: data?.totalOrders    ?? 0, icon: ShoppingCart,  idx: 1 },
    { label: 'Pending Orders',   value: data?.pendingOrders  ?? 0, icon: Clock,         idx: 2 },
    { label: 'Low Stock Alerts', value: data?.lowStockCount  ?? 0, icon: AlertTriangle, idx: 3 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Dashboard Overview
          </h1>
          <p className="mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            Real-time inventory &amp; sales insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/reports')}>
            <BarChart2 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button onClick={() => navigate('/products')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const c = kpiColors[kpi.idx];
          return (
            <Card
              key={kpi.idx}
              hoverable
              className="relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {kpi.label}
                  </p>
                  <h3 className="text-4xl font-bold mt-2" style={{ color: 'var(--text)' }}>
                    {kpi.value}
                  </h3>
                </div>
                <div
                  className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: c.icon,
                    color: c.iconText,
                    boxShadow: `0 0 16px ${c.glow}`,
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {/* Dynamic trending indicator could be added here later */}
              <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color: kpi.value > 0 ? '#22c55e' : 'var(--text-muted)' }}>
                {kpi.value > 0 && <TrendingUp className="w-3 h-3" />}
                <span>{kpi.value > 0 ? 'Active Monitoring' : 'No Data'}</span>
              </div>
              {/* Subtle glow bar at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${c.iconText}, transparent)` }}
              />
            </Card>
          );
        })}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sales Bar Chart */}
          <Card title="Sales Revenue" subtitle="Last 30 days performance" className="lg:col-span-2">
            <div className="h-[300px] mt-4">
              {analytics.length === 0 ? (
                <div
                  className="h-full flex flex-col items-center justify-center gap-3 opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BarChart2 className="w-10 h-10" />
                  <p className="text-sm font-medium">No sales data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      tick={{ fill: 'var(--text-muted)' } as any}
                      tickFormatter={v => v.slice(5)}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={11}
                      tick={{ fill: 'var(--text-muted)' } as any}
                      tickFormatter={v => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px var(--shadow)',
                        color: 'var(--text)',
                        backdropFilter: 'blur(12px)',
                      }}
                      cursor={{ fill: 'var(--bg-2)' }}
                    />
                    <Bar dataKey="sales" name="Revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

        {/* Pie Chart */}
        <Card title="Category Distribution" subtitle="Stock split by category">
          <div className="h-[300px] mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryStats || []}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data?.categoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px var(--shadow)',
                    color: 'var(--text)',
                    backdropFilter: 'blur(12px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {data?.totalProducts ?? 0}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Items
              </span>
            </div>
          </div>
        </Card>

        {/* Low Stock Table */}
        <Card
          title="Low Stock Alerts"
          subtitle="Items requiring replenishment"
          className="lg:col-span-3 overflow-hidden"
          headerAction={
            <Badge variant="error">{data?.lowStockCount ?? 0} critical</Badge>
          }
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left">
              <thead className="table-header">
                <tr>
                  {['Product', 'Category', 'Stock', 'Threshold', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!data?.lowStockProducts?.length ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center italic"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ✅ All systems nominal — no low stock items.
                    </td>
                  </tr>
                ) : (
                  data.lowStockProducts.map(p => (
                    <tr key={p._id} className="table-row">
                      <td className="px-6 py-4 font-bold" style={{ color: 'var(--text)' }}>{p.productName}</td>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-muted)' }}>{p.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-24 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--border)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min((p.quantity / p.lowStockThreshold) * 100, 100)}%`,
                                background: '#ef4444',
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold" style={{ color: '#ef4444' }}>{p.quantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-muted)' }}>{p.lowStockThreshold}</td>
                      <td className="px-6 py-4">
                        <Badge variant="error">Restock Now</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
