import { useEffect, useState } from 'react';
import { 
  Search, Filter, Eye, ShoppingBag, 
  Calendar, User as UserIcon, DollarSign,
  Trash2, Clock, RotateCcw, Loader2
} from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { OrderModal } from '../components/OrderModal';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, processing: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const { data } = await api.get('/orders', { params });
      
      // Filter by search client-side if needed or implement on backend
      const filtered = data.orders.filter((o: any) => 
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase())
      );
      
      setOrders(filtered || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status, startDate, endDate]); // Refetch on filter change

  // Separate effect for search with debounce if needed, but for now simple
  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/reports/dashboard');
        setStats({
          pending: data.pendingOrders || 0,
          processing: data.totalOrders - data.completedOrders - data.pendingOrders,
          revenue: data.totalStockValue // Placeholder or actual revenue
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'info';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action is permanent.')) {
      try {
        await api.delete(`/orders/${id}`);
        setOrders(orders.filter(o => o._id !== id));
      } catch (err) {
        alert('Failed to delete order');
      }
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Orders Management</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Track and process customer orders from real records</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Create New Order
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 py-4 border-none shadow-soft">
          <div className="p-3 rounded-xl bg-status-warning/10 text-status-warning"><Clock className="w-5 h-5" /></div>
          <div><p className="text-xs font-bold text-secondary-400 uppercase">Pending</p><p className="text-xl font-bold">{stats.pending} Orders</p></div>
        </Card>
        <Card className="flex items-center gap-4 py-4 border-none shadow-soft">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><ShoppingBag className="w-5 h-5" /></div>
          <div><p className="text-xs font-bold text-secondary-400 uppercase">Total</p><p className="text-xl font-bold">{orders.length} Records</p></div>
        </Card>
        <Card className="flex items-center gap-4 py-4 border-none shadow-soft">
          <div className="p-3 rounded-xl bg-status-success/10 text-status-success"><DollarSign className="w-5 h-5" /></div>
          <div><p className="text-xs font-bold text-secondary-400 uppercase">Total Revenue</p><p className="text-xl font-bold">${stats.revenue.toLocaleString()}</p></div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-secondary-900 p-4 rounded-2xl shadow-soft">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="input-field pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            className="input-field py-2 text-sm min-w-[140px]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input 
            type="date" 
            className="input-field py-1.5 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-secondary-400">to</span>
          <input 
            type="date" 
            className="input-field py-1.5 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <Button variant="secondary" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container border-none shadow-soft">
        <table className="w-full text-left">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Order ID</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Total Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-secondary-50 dark:border-secondary-800">
                  <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-secondary-500 font-bold italic">
                  No orders found matching criteria.
                  <Button variant="ghost" className="mt-4 block mx-auto" onClick={resetFilters}>Clear filters</Button>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="table-row group">
                  <td className="px-6 py-4 font-bold text-secondary-900 dark:text-white">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-500"><UserIcon className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">{order.customer?.name || 'Walk-in Customer'}</p>
                        <p className="text-xs text-secondary-400 font-medium">{order.customer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-500 font-medium">
                    {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-secondary-900 dark:text-white">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        className="p-2 rounded-lg text-secondary-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 rounded-lg text-secondary-400 hover:text-status-error hover:bg-status-error/5 transition-all"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details: #${selectedOrder?.orderNumber}`}
        size="lg"
        footer={<Button onClick={() => setIsModalOpen(false)}>Close Details</Button>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-secondary-400 uppercase mb-2">Customer Info</p>
              <p className="text-sm font-bold text-secondary-900 dark:text-white">{selectedOrder?.customer?.name}</p>
              <p className="text-sm text-secondary-500">{selectedOrder?.customer?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary-400 uppercase mb-2">Order Summary</p>
              <p className="text-sm font-bold text-secondary-900 dark:text-white">Status: {selectedOrder?.status}</p>
              <p className="text-sm text-secondary-500">Date: {new Date(selectedOrder?.orderDate || selectedOrder?.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-secondary-400 uppercase mb-4">Items</p>
            <div className="border border-secondary-100 dark:border-secondary-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary-50 dark:bg-secondary-800/50">
                  <tr>
                    <th className="px-4 py-2 font-bold">Product</th>
                    <th className="px-4 py-2 font-bold text-center">Qty</th>
                    <th className="px-4 py-2 font-bold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50 dark:divide-secondary-800">
                  {selectedOrder?.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium">{item.product?.productName}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-secondary-50 dark:bg-secondary-800/50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 font-bold text-right uppercase text-xs text-secondary-400">Total Amount</td>
                    <td className="px-4 py-3 font-bold text-right text-primary">${selectedOrder?.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* Create Order Modal */}
      <OrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
