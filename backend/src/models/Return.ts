import mongoose, { Schema, Document } from 'mongoose';

export type ReturnStatus = 'Requested' | 'Inspecting' | 'Restocked' | 'Damaged' | 'Rejected';

export interface IReturn extends Document {
  returnNumber: string;
  order: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  user: mongoose.Types.ObjectId; // Who processed
  refundAmount?: number;
  notes?: string;
  createdAt: Date;
}

const returnSchema = new Schema<IReturn>(
  {
    returnNumber: { type: String, required: true, unique: true },
    order:        { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    product:      { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity:     { type: Number, required: true, min: 1 },
    reason:       { type: String, required: true },
    status:       { type: String, enum: ['Requested', 'Inspecting', 'Restocked', 'Damaged', 'Rejected'], default: 'Requested' },
    user:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refundAmount: { type: Number, default: 0 },
    notes:        { type: String },
  },
  { timestamps: true }
);

export const Return = mongoose.model<IReturn>('Return', returnSchema);
