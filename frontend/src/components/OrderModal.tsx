import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import api from '../services/api';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, price: 0 }]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '', city: '', state: '', zip: '', country: 'India'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    try {
      const [custRes, wareRes, prodRes] = await Promise.all([
        api.get('/customers'),
        api.get('/warehouses'),
        api.get('/products?limit=100')
      ]);
      setCustomers(custRes.data.customers || custRes.data || []);
      setWarehouses(wareRes.data || []);
      setProducts(prodRes.data.products || []);
    } catch (err) {
      console.error('Failed to fetch dependencies', err);
    }
  };

  const addItem = () => setItems([...items, { product: '', quantity: 1, price: 0 }]);
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-fill price if product changes
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) newItems[index].price = prod.price;
    }
    
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedWarehouse || items.some(i => !i.product)) {
      setError('Please fill in all required fields and add at least one product.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        customer: selectedCustomer,
        warehouse: selectedWarehouse,
        items: items.map(i => ({
          product: i.product,
          quantity: Number(i.quantity),
          price: Number(i.price)
        })),
        shippingAddress
      };

      await api.post('/orders', orderData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sales Order" size="xl">
      <div className="space-y-6">
        {/* Core Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Customer *</label>
            <select 
              className="input-field w-full"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Dispatch Warehouse *</label>
            <select 
              className="input-field w-full"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl space-y-4">
          <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Shipping Address</p>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Street Address" 
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
            />
            <Input 
              label="City" 
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="State" 
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
            />
            <Input 
              label="Zip Code" 
              value={shippingAddress.zip}
              onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
            />
            <Input 
              label="Country" 
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
            />
          </div>
        </div>

        {/* Items Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Order Items</p>
            <Button variant="secondary" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-3 p-3 bg-white dark:bg-secondary-800 rounded-xl border border-secondary-100 dark:border-secondary-700 animate-slide-in">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold text-secondary-500">Product</label>
                  <select 
                    className="input-field w-full text-sm"
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.productName} (Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24 space-y-1.5">
                  <label className="text-xs font-bold text-secondary-500">Quantity</label>
                  <Input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="w-32 space-y-1.5">
                  <label className="text-xs font-bold text-secondary-500">Unit Price ($)</label>
                  <Input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeItem(index)}
                  className="text-status-error hover:bg-status-error/5 mb-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-sm font-bold">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-100 dark:border-secondary-800">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Place Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};
