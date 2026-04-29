import { useEffect, useState } from 'react';
import { ArrowRightLeft, Plus, Eye, CheckCircle, Box, User, Loader2, Info } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export default function StockTransfers() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // New Transfer State
  const [availableStock, setAvailableStock] = useState<number | null>(null);

  // Fetch warehouse-specific stock when product/warehouse selection changes
  useEffect(() => {
    const fetchSpecificStock = async () => {
      if (formData.product && formData.fromWarehouse) {
        try {
          const { data } = await api.get(`/stock/warehouse/${formData.fromWarehouse}`);
          const productStock = data.find((s: any) => s.product?._id === formData.product);
          setAvailableStock(productStock ? productStock.quantity : 0);
        } catch (err) { console.error(err); }
      } else {
        setAvailableStock(null);
      }
    };
    fetchSpecificStock();
  }, [formData.product, formData.fromWarehouse]);

  const fetchTransfers = async () => {
    try {
      const { data } = await api.get('/transfers');
      setTransfers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDependencies = async () => {
    try {
      const [wRes, pRes] = await Promise.all([
        api.get('/warehouses'),
        api.get('/products?limit=100')
      ]);
      setWarehouses(wRes.data);
      setProducts(pRes.data.products || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchTransfers();
    fetchDependencies();
  }, []);

  const handleComplete = async (id: string) => {
    if (!window.confirm('Mark this transfer as completed and update destination stock?')) return;
    try {
      await api.put(`/transfers/${id}/complete`);
      fetchTransfers();
      setIsModalOpen(false);
    } catch (err: any) { 
      alert(err.response?.data?.message || 'Failed to complete transfer'); 
    }
  };

  const handleCreateTransfer = async () => {
    if (!formData.product || !formData.fromWarehouse || !formData.toWarehouse || formData.quantity <= 0) {
      alert('Please fill all fields correctly.');
      return;
    }
    if (formData.fromWarehouse === formData.toWarehouse) {
      alert('Source and destination warehouses must be different.');
      return;
    }
    if (availableStock !== null && formData.quantity > availableStock) {
      alert(`Insufficient stock! Only ${availableStock} units available in source warehouse.`);
      return;
    }

    setSaving(true);
    try {
      await api.post('/transfers', formData);
      fetchTransfers();
      setIsNewModalOpen(false);
      setFormData({ product: '', fromWarehouse: '', toWarehouse: '', quantity: 1, notes: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate transfer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Stock Transfers</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Move inventory between locations (Real Records Only)</p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-secondary-100 dark:bg-secondary-800 animate-pulse rounded-2xl" />)
        ) : transfers.length === 0 ? (
          <Card className="p-12 text-center text-secondary-500 font-bold italic">
            No transfers recorded. Initiate a new transfer to move stock.
          </Card>
        ) : (
          transfers.map(trf => (
            <Card key={trf._id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all border-none shadow-soft">
              <div className="flex items-center gap-6 flex-1">
                <div className={`p-4 rounded-2xl ${trf.status === 'Completed' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning'}`}>
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">Product & Qty</p>
                    <p className="font-bold text-secondary-900 dark:text-white">{trf.product?.productName}</p>
                    <p className="text-sm font-bold text-primary">{trf.quantity} Units</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-secondary-400 uppercase mb-1">From</p>
                      <p className="text-sm font-bold">{trf.fromWarehouse?.name}</p>
                    </div>
                    <Box className="w-4 h-4 text-secondary-300" />
                    <div>
                      <p className="text-xs font-bold text-secondary-400 uppercase mb-1">To</p>
                      <p className="text-sm font-bold">{trf.toWarehouse?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Status</p>
                    <Badge variant={trf.status === 'Completed' ? 'success' : 'warning'}>{trf.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setSelectedTransfer(trf); setIsModalOpen(true); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
                {(trf.status === 'Pending Approval' || trf.status === 'Pending') && (
                  <Button size="sm" onClick={() => handleComplete(trf._id)}>Complete</Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Transfer Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Initiate New Stock Transfer"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTransfer} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Initiate Transfer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">From Warehouse</label>
              <select 
                className="input-field"
                value={formData.fromWarehouse}
                onChange={(e) => setFormData({...formData, fromWarehouse: e.target.value})}
              >
                <option value="">-- Source --</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">To Warehouse</label>
              <select 
                className="input-field"
                value={formData.toWarehouse}
                onChange={(e) => setFormData({...formData, toWarehouse: e.target.value})}
              >
                <option value="">-- Destination --</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Select Product</label>
            <select 
              className="input-field"
              value={formData.product}
              onChange={(e) => setFormData({...formData, product: e.target.value})}
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.productName} (SKU: {p.sku})</option>)}
            </select>
            {availableStock !== null && (
              <p className="text-xs font-bold text-primary mt-1">
                Available in source: {availableStock} units
              </p>
            )}
          </div>

          <Input 
            label="Quantity to Transfer" 
            type="number" 
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Notes (Optional)</label>
            <textarea 
              className="input-field min-h-[80px] py-2" 
              placeholder="Reason for transfer..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-xs text-secondary-500">
              Note: Initiating a transfer will immediately deduct the quantity from the source warehouse. Destination stock will update upon completion.
            </p>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transfer Details"
        footer={<Button onClick={() => setIsModalOpen(false)}>Close</Button>}
      >
        {selectedTransfer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-secondary-400" />
                <div>
                  <p className="text-xs font-bold text-secondary-400 uppercase">Initiated By</p>
                  <p className="text-sm font-bold text-secondary-900 dark:text-white">{selectedTransfer.user?.username || 'System'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-secondary-400 uppercase">Date</p>
                <p className="text-sm font-bold text-secondary-900 dark:text-white">{new Date(selectedTransfer.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-secondary-400 uppercase">Notes</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 p-4 rounded-xl italic">
                {selectedTransfer.notes || 'No notes provided for this transfer.'}
              </p>
            </div>

            {selectedTransfer.status === 'Completed' ? (
              <div className="flex items-center gap-3 p-4 bg-status-success/5 border border-status-success/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-status-success" />
                <div>
                  <p className="text-sm font-bold text-status-success">Transfer Completed</p>
                  <p className="text-xs text-secondary-500">Inventory has been successfully moved to the destination warehouse.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-status-warning/5 border border-status-warning/20 rounded-xl">
                <Info className="w-5 h-5 text-status-warning" />
                <div>
                  <p className="text-sm font-bold text-status-warning">Pending Completion</p>
                  <p className="text-xs text-secondary-500">Stock is currently held from the source warehouse.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
