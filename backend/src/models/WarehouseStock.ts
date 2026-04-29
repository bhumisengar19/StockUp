import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseStock extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  quantity: number;
  lastUpdated: Date;
}

const warehouseStockSchema = new Schema<IWarehouseStock>(
  {
    product:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity:  { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

// Unique index to ensure one entry per product-warehouse pair
warehouseStockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

export const WarehouseStock = mongoose.model<IWarehouseStock>('WarehouseStock', warehouseStockSchema);
