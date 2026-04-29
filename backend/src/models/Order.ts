import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  timeline: { status: OrderStatus; date: Date; note?: string }[];
  invoiceUrl?: string;
  trackingNumber?: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true, min: 0 },
  tax:      { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer:    { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    warehouse:   { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items:       [orderItemSchema],
    subtotal:    { type: Number, required: true, min: 0 },
    taxAmount:   { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status:      { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], default: 'Pending', index: true },
    paymentStatus: { type: String, enum: ['Unpaid', 'Partial', 'Paid', 'Refunded'], default: 'Unpaid' },
    paymentMethod: { type: String },
    shippingAddress: {
      street: { type: String, required: true },
      city:   { type: String, required: true },
      state:  { type: String, required: true },
      zip:    { type: String, required: true },
      country:{ type: String, required: true },
    },
    timeline:    [{ 
      status: { type: String },
      date:   { type: Date, default: Date.now },
      note:   { type: String }
    }],
    invoiceUrl:  { type: String },
    trackingNumber: { type: String },
    orderDate:   { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Add initial timeline event on create
orderSchema.pre('save', function(next: any) {
  if (this.isNew) {
    this.timeline.push({ status: this.status, date: new Date(), note: 'Order created' });
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
