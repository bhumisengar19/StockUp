import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ImageIcon, Plus, UploadCloud, X } from 'lucide-react';
import { useProductStore } from '../store/productStore';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: any;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, selectedProduct }) => {
  const { createProduct, updateProduct, isLoading } = useProductStore();
  
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    subcategory: '',
    sku: '',
    price: '',
    costPrice: '',
    quantity: '',
    lowStockThreshold: '',
    tags: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        productName: selectedProduct.productName || '',
        category: selectedProduct.category || '',
        subcategory: selectedProduct.subcategory || '',
        sku: selectedProduct.sku || '',
        price: selectedProduct.price?.toString() || '',
        costPrice: selectedProduct.costPrice?.toString() || '',
        quantity: selectedProduct.quantity?.toString() || '',
        lowStockThreshold: selectedProduct.lowStockThreshold?.toString() || '',
        tags: selectedProduct.tags?.join(', ') || ''
      });
      setImagePreview(selectedProduct.imageUrl || null);
      setImageFile(null);
    } else {
      setFormData({
        productName: '',
        category: '',
        subcategory: '',
        sku: '',
        price: '',
        costPrice: '',
        quantity: '',
        lowStockThreshold: '',
        tags: ''
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setError(null);
  }, [selectedProduct, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (document.getElementById('image-upload')) {
      (document.getElementById('image-upload') as HTMLInputElement).value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!formData.productName || !formData.category || !formData.price || !formData.quantity) {
        setError('Please fill in all required fields (Product Name, Category, Sale Price, Initial Quantity)');
        return;
      }

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          if (key === 'tags') {
             const tagsArray = value.toString().split(',').map(t => t.trim()).filter(Boolean);
             tagsArray.forEach(tag => submitData.append('tags', tag));
          } else {
             submitData.append(key, value.toString());
          }
        }
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (selectedProduct) {
        await updateProduct(selectedProduct._id, submitData as any);
      } else {
        await createProduct(submitData as any);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      size="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
        {/* Left Column */}
        <div className="space-y-5">
          <Input 
            name="productName"
            label="Product Name *" 
            placeholder="e.g. Premium Wireless Mouse" 
            value={formData.productName}
            onChange={handleChange}
            className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="category"
              label="Category *" 
              placeholder="e.g. Electronics" 
              value={formData.category}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Input 
              name="subcategory"
              label="Subcategory" 
              placeholder="e.g. Peripherals" 
              value={formData.subcategory}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <Input 
            name="sku"
            label="SKU" 
            placeholder="e.g. WMS-001 (Auto-generated if empty)" 
            value={formData.sku}
            onChange={handleChange}
            className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="price"
              label="Sale Price ($) *" 
              type="number" 
              placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Input 
              name="costPrice"
              label="Cost Price ($)" 
              type="number" 
              placeholder="0.00"
              value={formData.costPrice}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div className="space-y-1.5">
             <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300">
               Product Image
             </label>
             <div className="relative group p-6 border-2 border-dashed border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
               {imagePreview ? (
                 <div className="relative w-full h-full flex items-center justify-center">
                   <img src={imagePreview} alt="Preview" className="max-h-[120px] object-contain rounded-lg" />
                   <button 
                     type="button"
                     onClick={(e) => { e.stopPropagation(); removeImage(); }}
                     className="absolute top-0 right-0 p-1.5 bg-status-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ) : (
                 <>
                   <UploadCloud className="w-10 h-10 text-secondary-400 mb-3 group-hover:text-primary transition-colors" />
                   <p className="text-sm font-semibold text-secondary-600 dark:text-secondary-300">Click to upload product image</p>
                   <p className="text-xs text-secondary-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                 </>
               )}
               <input 
                 id="image-upload"
                 type="file" 
                 accept="image/*"
                 onChange={handleImageChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
             </div>
          </div>

          <Input 
            name="tags"
            label="Tags (comma separated)" 
            placeholder="wireless, ergonomic, mouse" 
            value={formData.tags}
            onChange={handleChange}
            className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="quantity"
              label="Initial Quantity *" 
              type="number" 
              placeholder="0"
              value={formData.quantity}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Input 
              name="lowStockThreshold"
              label="Stock Threshold" 
              type="number" 
              placeholder="10"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder:text-secondary-400 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
             <label className="text-sm font-bold text-secondary-700 dark:text-secondary-300">Variants</label>
             <Button variant="secondary" size="sm" className="w-full bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 border-none">
                <Plus className="w-3 h-3 mr-2" /> Add Variant (Size/Color)
             </Button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 border-none">
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading} className="min-w-[120px]">
          Save Product
        </Button>
      </div>
    </Modal>
  );
};
