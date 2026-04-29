import mongoose, { Schema, Document } from 'mongoose';

export type AdjustmentType = 'Damage' | 'Loss' | 'Return' | 'Correction';

export interface IInventoryAdjustment extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  quantity: number; // Positive for gain, negative for loss
  type: AdjustmentType;
  reason: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const inventoryAdjustmentSchema = new Schema<IInventoryAdjustment>(
  {
    product:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity:  { type: Number, required: true },
    type:      { type: String, enum: ['Damage', 'Loss', 'Return', 'Correction'], required: true },
    reason:    { type: String, required: true, trim: true },
    user:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const InventoryAdjustment = mongoose.model<IInventoryAdjustment>('InventoryAdjustment', inventoryAdjustmentSchema);
