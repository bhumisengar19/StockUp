import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  supplierName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    supplierName: { type: String, required: true, trim: true },
    contactName:  { type: String, trim: true },
    email:        { type: String, required: true, lowercase: true, trim: true },
    phone:        { type: String, trim: true },
    address:      { type: String, trim: true },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
