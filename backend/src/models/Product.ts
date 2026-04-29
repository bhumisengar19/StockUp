import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  name: string; // e.g. "Size"
  options: string[]; // e.g. ["S", "M", "L"]
}

export interface IProduct extends Document {
  productName: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  costPrice: number; // For profit reports
  quantity: number; // Total quantity
  lowStockThreshold: number;
  description?: string;
  imageUrl?: string;
  variants: IProductVariant[];
  taxRate: number; // Percentage
  status: 'active' | 'archived' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productName:       { type: String, required: true, trim: true, index: true },
    sku:               { type: String, required: true, unique: true, trim: true, uppercase: true },
    barcode:           { type: String, unique: true, sparse: true },
    qrCode:            { type: String, unique: true, sparse: true },
    category:          { type: String, required: true, trim: true, index: true },
    subcategory:       { type: String, trim: true },
    tags:              [{ type: String, trim: true }],
    price:             { type: Number, required: true, min: 0 },
    costPrice:         { type: Number, required: true, min: 0, default: 0 },
    quantity:          { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    description:       { type: String, trim: true },
    imageUrl:          { type: String },
    variants:          [
      {
        name: { type: String },
        options: [{ type: String }]
      }
    ],
    taxRate:           { type: Number, default: 0 },
    status:            { type: String, enum: ['active', 'archived', 'draft'], default: 'active' },
  },
  { timestamps: true }
);

// Indexes for text search and performance
productSchema.index({ productName: 'text', category: 'text', sku: 'text', tags: 'text' });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
