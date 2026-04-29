import mongoose, { Schema, Document } from 'mongoose';

export type POStatus = 'Draft' | 'Pending Approval' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';

export interface IPOItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  costPrice: number;
  receivedQuantity: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  items: IPOItem[];
  totalAmount: number;
  status: POStatus;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  user: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber:    { type: String, required: true, unique: true },
    supplier:    { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouse:   { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items:       [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        costPrice: { type: Number, required: true, min: 0 },
        receivedQuantity: { type: Number, default: 0 }
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    status:      { type: String, enum: ['Draft', 'Pending Approval', 'Sent', 'Partial', 'Received', 'Cancelled'], default: 'Draft' },
    orderDate:   { type: Date, default: Date.now },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    notes:       { type: String },
    user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
