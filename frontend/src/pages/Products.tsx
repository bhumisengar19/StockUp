import { useEffect, useState } from 'react';
import { useProductStore } from '../store/productStore';
import { 
  Plus, Search, Filter, Edit, Trash2, Package, Image as ImageIcon,
  QrCode, Download, Upload, CheckCircle, RotateCcw, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProductModal } from '../components/ProductModal';
import api from '../services/api';

export default function Products() {
  const { products, isLoading, fetchProducts, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchProducts({ search, category, stockStatus });
  }, [fetchProducts, search, category, stockStatus]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setStockStatus('');
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports/export/inventory?format=csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">Products Catalog</h1>
          <p className="text-secondary-500 dark:text-secondary-400 mt-1 font-medium">Manage your items, stock, and pricing</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-secondary-900 p-4 rounded-2xl shadow-soft">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            className="input-field pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            className="input-field py-2 text-sm min-w-[140px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="input-field py-2 text-sm min-w-[140px]"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="inStock">In Stock</option>
            <option value="lowStock">Low Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          <Button variant="secondary" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleExportCSV} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container border-none shadow-soft">
        <table className="w-full text-left">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Product Info</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest">Category & Tags</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Pricing</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase text-right">Inventory</th>
              <th className="px-6 py-4 text-xs font-bold text-secondary-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-secondary-100 dark:bg-secondary-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <Package className="w-12 h-12 mx-auto text-secondary-200 mb-4" />
                  <p className="text-secondary-500 font-bold">No products found matching your filters</p>
                  <Button variant="ghost" className="mt-4" onClick={resetFilters}>Clear all filters</Button>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center overflow-hidden border border-secondary-200 dark:border-secondary-700">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-secondary-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900 dark:text-white group-hover:text-primary transition-colors">{p.productName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] font-bold text-secondary-400 bg-secondary-50 dark:bg-secondary-800 px-1.5 py-0.5 rounded border border-secondary-100 dark:border-secondary-700">
                             SKU: {p.sku}
                           </span>
                           {p.qrCode && <QrCode className="w-3 h-3 text-secondary-300" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <Badge variant="secondary" className="w-fit">{p.category}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {p.tags?.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[9px] font-bold text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-1 rounded uppercase tracking-tighter">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-secondary-900 dark:text-white">${p.price.toFixed(2)}</p>
                    <p className="text-[10px] text-secondary-400 font-medium">Cost: ${p.costPrice?.toFixed(2) || '0.00'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-sm font-bold ${p.quantity <= p.lowStockThreshold ? 'text-status-error' : 'text-status-success'}`}>
                        {p.quantity} Units
                      </span>
                      <div className="w-20 h-1 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${p.quantity <= p.lowStockThreshold ? 'bg-status-error' : 'bg-status-success'}`}
                          style={{ width: `${Math.min((p.quantity / (p.lowStockThreshold * 2)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }}
                        className="p-2 rounded-lg text-secondary-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p._id)}
                        className="p-2 rounded-lg text-secondary-400 hover:text-status-error hover:bg-status-error/5 transition-all"
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

      {/* Main Upsert Modal */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedProduct={selectedProduct} 
      />

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Product Import"
      >
        <div className="space-y-6">
          <div className="p-8 border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl text-center cursor-pointer hover:bg-primary/10 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="font-bold text-secondary-900 dark:text-white">Drop your CSV here</h3>
            <p className="text-sm text-secondary-500 mt-1">or click to browse your files</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">Requirements</p>
            <ul className="text-xs text-secondary-500 space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-status-success" /> CSV file format only</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-status-success" /> Headers: productName, sku, category, price, quantity</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-status-success" /> Max 500 rows per import</li>
            </ul>
          </div>
          <Button className="w-full" variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Download Sample Template
          </Button>
        </div>
      </Modal>
    </div>
  );
}
