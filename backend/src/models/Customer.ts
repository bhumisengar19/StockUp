import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name:        { type: String, required: true, trim: true, index: true },
    email:       { type: String, lowercase: true, trim: true, unique: true },
    phone:       { type: String, trim: true },
    address:     { type: String, trim: true },
    taxNumber:   { type: String, trim: true },
    totalOrders: { type: Number, default: 0 },
    totalSpent:  { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
