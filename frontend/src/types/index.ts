import { Permission } from '../config/permissions';

export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer' | 'supplier' | 'customer';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  linkedId?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  items: Array<{
    productId: string | any;
    productName: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  user: any;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
