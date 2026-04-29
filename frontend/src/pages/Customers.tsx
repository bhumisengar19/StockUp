import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Search, Plus, Edit, Trash2, Loader2, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(data.customers || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (c: any = null) => {
    if (c) {
      setSelectedCustomer(c);
      setFormData({ name: c.name, email: c.email, phone: c.phone, address: c.address });
    } else {
      setSelectedCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer._id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      fetchCustomers();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        alert('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Customer Directory</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Manage your client relationships (Real Records Only)</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" />Add Customer</Button>
      </div>

      <Card className="border-none shadow-soft">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="input-field pl-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSearch('')}><RotateCcw className="w-4 h-4 mr-2" />Reset</Button>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Address</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded w-full"></div></td></tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-secondary-500 font-bold italic">No customers found.</td></tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c._id} className="table-row group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary flex items-center justify-center font-bold">
                          {c.name[0]}
                        </div>
                        <p className="font-bold text-secondary-900 dark:text-white">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        <Mail className="w-3 h-3" /> {c.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-secondary-500 font-medium">
                        <MapPin className="w-3 h-3" /> {c.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(c)} className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-status-error/5 text-secondary-400 hover:text-status-error transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upsert Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {selectedCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Email Address" type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Input label="Shipping Address" placeholder="123 Street, City, Country" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
}
