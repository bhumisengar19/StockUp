import { create } from 'zustand';
import api from '../services/api';

export interface Product {
  _id: string;
  productName: string;
  category: string;
  subcategory?: string;
  sku: string;
  qrCode?: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  tags?: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  productName: string;
  category: string;
  subcategory?: string;
  sku?: string;
  price: number;
  costPrice: number;
  quantity: number;
  lowStockThreshold: number;
  tags?: string;
}

interface ProductState {
  products: Product[];
  lowStockProducts: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (query?: any) => Promise<void>;
  fetchLowStock: () => Promise<void>;
  createProduct: (data: ProductFormData | FormData) => Promise<void>;
  updateProduct: (id: string, data: Partial<ProductFormData> | FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  lowStockProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/products', { params: query });
      set({ products: data.products, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchLowStock: async () => {
    try {
      const { data } = await api.get('/products/low-stock');
      set({ lowStockProducts: data });
    } catch {
      // silently fail — not critical
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/products', productData);
      await get().fetchProducts();
      await get().fetchLowStock();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/products/${id}`, productData);
      await get().fetchProducts();
      await get().fetchLowStock();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/products/${id}`);
      await get().fetchProducts();
      await get().fetchLowStock();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to delete product', isLoading: false });
      throw error;
    }
  },
}));
