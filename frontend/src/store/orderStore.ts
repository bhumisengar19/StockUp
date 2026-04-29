import { create } from 'zustand';
import api from '../services/api';
import type { Product } from './productStore';

export type OrderStatus = 'Pending' | 'Processing' | 'Delivered';

export interface Order {
  _id: string;
  customerName: string;
  productId: Product | string;
  quantity: number;
  totalValue: number;
  status: OrderStatus;
  orderDate: string;
}

export interface OrderFormData {
  customerName: string;
  productId: string;
  quantity: number;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  fetchOrders: (query?: { status?: string; customerName?: string }) => Promise<void>;
  createOrder: (data: OrderFormData) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/orders', { params: query });
      set({ orders: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/orders', orderData);
      await get().fetchOrders();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/orders/${id}/status`, { status });
      await get().fetchOrders();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update order status', isLoading: false });
      throw error;
    }
  },
}));
