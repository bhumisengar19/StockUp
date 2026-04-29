import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  location: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity: number; // In units or volume
  type: 'Main' | 'Regional' | 'Retail' | 'Damaged';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name:          { type: String, required: true, trim: true, unique: true },
    location:      { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone:         { type: String, trim: true },
    email:         { type: String, trim: true },
    capacity:      { type: Number, required: true, min: 0 },
    type:          { type: String, enum: ['Main', 'Regional', 'Retail', 'Damaged'], default: 'Main' },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
