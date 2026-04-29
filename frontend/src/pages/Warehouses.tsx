import { useEffect, useState } from 'react';
import { Database, MapPin, Plus, Edit2, Box, Trash2, Loader2, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [warehouseStock, setWarehouseStock] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 0,
    type: 'Main'
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/warehouses');
      setWarehouses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStock = async (id: string) => {
    try {
      const { data } = await api.get(`/stock/warehouse/${id}`);
      setWarehouseStock(data);
      setIsStockModalOpen(true);
    } catch (err) { alert('Failed to fetch stock'); }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenModal = (w: any = null) => {
    if (w) {
      setSelectedWarehouse(w);
      setFormData({
        name: w.name,
        location: w.location,
        capacity: w.capacity,
        type: w.type || 'Main'
      });
    } else {
      setSelectedWarehouse(null);
      setFormData({ name: '', location: '', capacity: 0, type: 'Main' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.location || formData.capacity <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }

    setSaving(true);
    try {
      if (selectedWarehouse) {
        await api.put(`/warehouses/${selectedWarehouse._id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      fetchWarehouses();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save warehouse');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await api.delete(`/warehouses/${id}`);
        fetchWarehouses();
      } catch (err) {
        alert('Failed to delete warehouse');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Warehouse Management</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Control inventory across multiple locations (Real Data Only)</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-secondary-100 dark:bg-secondary-800 animate-pulse rounded-2xl" />)
        ) : warehouses.length === 0 ? (
          <Card className="col-span-full py-20 text-center text-secondary-500 font-bold italic">
            No warehouses found. Please create one to manage stock.
          </Card>
        ) : (
          warehouses.map(w => (
            <Card key={w._id} className="relative group overflow-hidden border-none shadow-soft">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${w.isActive !== false ? 'bg-primary/10 text-primary' : 'bg-secondary-100 text-secondary-400'}`}>
                  <Database className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(w)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-secondary-400" /></button>
                  <button onClick={() => handleDelete(w._id)} className="p-2 hover:bg-status-error/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-status-error" /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">{w.name}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-secondary-500 font-medium">
                  <MapPin className="w-4 h-4" /> {w.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-500 font-medium">
                  <Badge variant="secondary" className="capitalize">{w.type}</Badge>
                  {w.isActive !== false ? <Badge variant="success">Active</Badge> : <Badge variant="error">Inactive</Badge>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-secondary-50 dark:border-secondary-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-secondary-400 uppercase">Capacity</span>
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">{w.capacity} Units</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => fetchStock(w._id)}>
                  <Box className="w-4 h-4 mr-2" />
                  View Stock
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Stock Viewer Modal */}
      <Modal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        title="Warehouse Inventory" 
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-50 dark:bg-secondary-800/50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-secondary-400 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-bold text-secondary-400 uppercase">SKU</th>
                <th className="px-4 py-3 text-xs font-bold text-secondary-400 uppercase text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50 dark:divide-secondary-800">
              {warehouseStock.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-secondary-500 italic">No stock in this location</td></tr>
              ) : (
                warehouseStock.map(s => (
                  <tr key={s._id}>
                    <td className="px-4 py-3 font-bold text-secondary-900 dark:text-white">{s.product?.productName}</td>
                    <td className="px-4 py-3 text-sm text-secondary-500">{s.product?.sku}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary">{s.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Upsert Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {selectedWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Warehouse Name" 
            placeholder="e.g. Central Hub" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            label="Location" 
            placeholder="e.g. 123 Industry Park, New York" 
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Capacity (Units)" 
              type="number" 
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Type</label>
              <select 
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Main">Main Distribution</option>
                <option value="Regional">Regional</option>
                <option value="Retail">Retail Outlet</option>
                <option value="Damaged">Damaged/Returns</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
