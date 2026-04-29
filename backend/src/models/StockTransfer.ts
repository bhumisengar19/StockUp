import mongoose, { Schema, Document } from 'mongoose';

export type TransferStatus = 'Pending Approval' | 'Approved' | 'In Transit' | 'Completed' | 'Cancelled';

export interface IStockTransfer extends Document {
  transferNumber: string;
  product: mongoose.Types.ObjectId;
  fromWarehouse: mongoose.Types.ObjectId;
  toWarehouse: mongoose.Types.ObjectId;
  quantity: number;
  status: TransferStatus;
  user: mongoose.Types.ObjectId;
  notes?: string;
  approver?: mongoose.Types.ObjectId;
  receivedBy?: mongoose.Types.ObjectId;
  receivedDate?: Date;
}

const stockTransferSchema = new Schema<IStockTransfer>(
  {
    transferNumber: { type: String, required: true, unique: true },
    product:        { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    fromWarehouse:  { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    toWarehouse:    { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity:       { type: Number, required: true, min: 1 },
    status:         { type: String, enum: ['Pending Approval', 'Approved', 'In Transit', 'Completed', 'Cancelled'], default: 'Pending Approval' },
    user:           { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes:          { type: String },
    approver:       { type: Schema.Types.ObjectId, ref: 'User' },
    receivedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
    receivedDate:   { type: Date },
  },
  { timestamps: true }
);

export const StockTransfer = mongoose.model<IStockTransfer>('StockTransfer', stockTransferSchema);
