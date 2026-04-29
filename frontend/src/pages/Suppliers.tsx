import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Search, Plus, Edit, Trash2, Loader2, RotateCcw, Building2 } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplierName: '',
    contactName: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (s: any = null) => {
    if (s) {
      setSelectedSupplier(s);
      setFormData({ 
        supplierName: s.supplierName, 
        contactName: s.contactName, 
        email: s.email, 
        phone: s.phone, 
        address: s.address 
      });
    } else {
      setSelectedSupplier(null);
      setFormData({ supplierName: '', contactName: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.supplierName || !formData.email) {
      alert('Company Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      if (selectedSupplier) {
        await api.put(`/suppliers/${selectedSupplier._id}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      fetchSuppliers();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert('Failed to delete supplier');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactName && s.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Supplier Management</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Manage your procurement partners (Real Data Only)</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" />Add Supplier</Button>
      </div>

      <Card className="border-none shadow-soft">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
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
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Supplier / Company</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Contact Person</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={4} className="px-6 py-8"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded w-full"></div></td></tr>
                ))
              ) : filteredSuppliers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-secondary-500 font-bold italic">No suppliers found.</td></tr>
              ) : (
                filteredSuppliers.map(s => (
                  <tr key={s._id} className="table-row group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary-100 text-secondary-600 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-secondary-900 dark:text-white">{s.supplierName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-secondary-700 dark:text-secondary-300">
                      {s.contactName}
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        <Mail className="w-3 h-3" /> {s.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-secondary-600 dark:text-secondary-400">
                        <Phone className="w-3 h-3" /> {s.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(s)} className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-400 transition-all"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-status-error/5 text-secondary-400 hover:text-status-error transition-all"><Trash2 className="w-4 h-4" /></button>
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
        title={selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {selectedSupplier ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Company Name" placeholder="e.g. Acme Corp" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} />
          <Input label="Contact Person" placeholder="e.g. Jane Smith" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
          <Input label="Email Address" type="email" placeholder="jane@acme.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Input label="Business Address" placeholder="456 Industrial Way, City, Country" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
      </Modal>
    </div>
  );
}
