import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Eye, CheckCircle, Package, Truck, User, Loader2, Search, RotateCcw, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export default function PurchaseOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // New PO State
  const [formData, setFormData] = useState({
    supplier: '',
    warehouse: '',
    expectedDate: '',
    notes: '',
    items: [{ product: '', quantity: 1, costPrice: 0 }]
  });

  const fetchPOs = async () => {
    try {
      const { data } = await api.get('/purchase-orders');
      setPos(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDependencies = async () => {
    try {
      const [sRes, wRes, pRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/products?limit=100')
      ]);
      setSuppliers(sRes.data);
      setWarehouses(wRes.data);
      setProducts(pRes.data.products || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPOs();
    fetchDependencies();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, costPrice: 0 }]
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    
    // Auto-fill cost price if product selected
    if (field === 'product') {
      const product = products.find(p => p._id === value);
      if (product) newItems[index].costPrice = product.costPrice || 0;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleCreatePO = async () => {
    if (!formData.supplier || !formData.warehouse || formData.items.some(i => !i.product || i.quantity <= 0)) {
      alert('Please fill all fields correctly.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/purchase-orders', formData);
      fetchPOs();
      setIsNewModalOpen(false);
      setFormData({ supplier: '', warehouse: '', expectedDate: '', notes: '', items: [{ product: '', quantity: 1, costPrice: 0 }] });
    } catch (err) {
      alert('Failed to create purchase order');
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async (poId: string, items: any[]) => {
    if (!window.confirm('Mark this PO as received? This will update warehouse stock.')) return;
    try {
      await api.put(`/purchase-orders/${poId}/receive`, {
        receivedItems: items.map(i => ({ productId: i.product._id, quantity: i.quantity }))
      });
      fetchPOs();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to receive order');
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * (item.costPrice || 0)), 0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Purchase Orders</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Procure inventory from suppliers (Real Data Only)</p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-secondary-100 dark:bg-secondary-800 animate-pulse rounded-2xl" />)
        ) : pos.length === 0 ? (
          <Card className="p-12 text-center text-secondary-500 font-bold italic">
            No purchase orders found. Start by creating your first PO.
          </Card>
        ) : (
          pos.map(po => (
            <Card key={po._id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all border-none shadow-soft">
              <div className="flex items-center gap-6 flex-1">
                <div className={`p-4 rounded-2xl ${po.status === 'Received' ? 'bg-status-success/10 text-status-success' : 'bg-primary/10 text-primary'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1">PO Number</p>
                    <p className="font-bold text-secondary-900 dark:text-white">#{po.poNumber}</p>
                    <p className="text-xs text-secondary-400">{new Date(po.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Supplier</p>
                    <p className="text-sm font-bold">{po.supplier?.supplierName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-primary">${po.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Status</p>
                    <Badge variant={po.status === 'Received' ? 'success' : 'info'}>{po.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => { setSelectedPO(po); setIsModalOpen(true); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
                {po.status !== 'Received' && (
                  <Button size="sm" onClick={() => handleReceive(po._id, po.items)}>Mark Received</Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New PO Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Purchase Order"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePO} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create PO
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Supplier</label>
              <select 
                className="input-field"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.supplierName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Warehouse</label>
              <select 
                className="input-field"
                value={formData.warehouse}
                onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
              >
                <option value="">-- Select Destination --</option>
                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Order Items</h3>
              <Button variant="secondary" size="sm" onClick={handleAddItem}>
                <Plus className="w-3 h-3 mr-2" /> Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-end gap-3 p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl animate-slide-in">
                  <div className="flex-1 space-y-1">
                     <label className="text-[10px] font-bold text-secondary-400 uppercase">Product</label>
                     <select 
                      className="input-field py-1.5 text-sm"
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    >
                      <option value="">Choose Product</option>
                      {products.map(p => <option key={p._id} value={p._id}>{p.productName}</option>)}
                    </select>
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[10px] font-bold text-secondary-400 uppercase">Qty</label>
                    <Input 
                      type="number" 
                      placeholder="Qty" 
                      className="py-1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-[10px] font-bold text-secondary-400 uppercase">Cost Price ($)</label>
                    <Input 
                      type="number" 
                      placeholder="Price" 
                      className="py-1"
                      value={item.costPrice}
                      onChange={(e) => handleItemChange(index, 'costPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-status-error hover:bg-status-error/5 mb-0.5"
                      onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== index)})}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
              <span className="text-sm font-bold text-secondary-500">Estimated Total Cost:</span>
              <span className="text-xl font-bold text-primary">${calculateTotal(formData.items).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <Input 
            label="Notes" 
            placeholder="Special instructions..." 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Purchase Order: #${selectedPO?.poNumber}`}
        size="lg"
        footer={<Button onClick={() => setIsModalOpen(false)}>Close</Button>}
      >
        {selectedPO && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Supplier Details</p>
                <p className="text-sm font-bold">{selectedPO.supplier?.supplierName}</p>
                <p className="text-xs text-secondary-500">{selectedPO.supplier?.contactPerson}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-secondary-400 uppercase mb-1">Status</p>
                <Badge variant={selectedPO.status === 'Received' ? 'success' : 'info'}>{selectedPO.status}</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-secondary-400 uppercase mb-4">Ordered Items</p>
              <div className="border border-secondary-100 dark:border-secondary-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary-50 dark:bg-secondary-800/50">
                    <tr>
                      <th className="px-4 py-2 font-bold">Product</th>
                      <th className="px-4 py-2 font-bold text-center">Ordered</th>
                      <th className="px-4 py-2 font-bold text-center">Received</th>
                      <th className="px-4 py-2 font-bold text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50 dark:divide-secondary-800">
                    {selectedPO.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">{item.product?.productName}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-center font-bold text-primary">{item.receivedQuantity}</td>
                        <td className="px-4 py-3 text-right">${item.costPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-secondary-50 dark:bg-secondary-800/50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 font-bold text-right uppercase text-xs text-secondary-400">Grand Total</td>
                      <td className="px-4 py-3 font-bold text-right text-primary">${selectedPO.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
