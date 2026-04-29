import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/Order';
import { Product } from '../models/Product';
import { Customer } from '../models/Customer';
import { updateWarehouseStock } from './warehouseStockController';
import { InventoryAdjustment } from '../models/InventoryAdjustment';
import { logActivity } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';
import { getIO } from '../sockets';
import { sendEmail } from '../utils/email';

const generateOrderNumber = () => {
  return 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      customer: customerId, 
      warehouse: warehouseId, 
      items, 
      shippingAddress, 
      paymentMethod,
      discountAmount = 0 
    } = req.body;

    if (!customerId || !warehouseId || !items || !items.length) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    let subtotal = 0;
    let totalTax = 0;
    const processedItems = [];

    // Verify and process items
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      const itemTax = (product.price * item.quantity) * (product.taxRate / 100);
      const itemSubtotal = product.price * item.quantity;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        tax: itemTax,
        discount: 0 // Could add per-item discount logic
      });

      subtotal += itemSubtotal;
      totalTax += itemTax;

      // Deduct from warehouse
      await updateWarehouseStock(product._id.toString(), warehouseId, -item.quantity, session);
      
      // Log low stock via socket
      if ((product.quantity - item.quantity) <= product.lowStockThreshold) {
        getIO().emit('notification', { type: 'low_stock', message: `${product.productName} is critically low on stock!` });
      }
    }

    const totalAmount = subtotal + totalTax - discountAmount;
    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      customer: customerId,
      warehouse: warehouseId,
      items: processedItems,
      subtotal,
      taxAmount: totalTax,
      discountAmount,
      totalAmount,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      paymentMethod,
      shippingAddress
    });

    await order.save({ session });

    // Update Customer Stats
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalOrders: 1, totalSpent: totalAmount },
      $set: { lastOrderDate: new Date() }
    }).session(session);

    // Audit Log for Stock out
    for (const item of processedItems) {
      await InventoryAdjustment.create([{
        product: item.product,
        warehouse: warehouseId,
        type: 'Correction', // or a new type 'Sale'
        quantity: -item.quantity,
        reason: `Sale Order ${orderNumber}`,
        user: req.user?._id
      }], { session });
    }

    await session.commitTransaction();
    
    getIO().emit('notification', { type: 'new_order', message: `New order confirmed: ${orderNumber}` });
    
    if (req.user) {
      await logActivity(req.user._id.toString(), 'Created Order', 'Orders', `Order: ${orderNumber}`);
    }

    res.status(201).json(order);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    
    if (req.query.startDate && req.query.endDate) {
      query.orderDate = { $gte: new Date(req.query.startDate as string), $lte: new Date(req.query.endDate as string) };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('warehouse', 'name')
      .populate('items.product', 'productName sku')
      .skip(skip).limit(limit).sort({ orderDate: -1 });

    const total = await Order.countDocuments(query);

    res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus, trackingNumber, note } = req.body;
    const order = await Order.findById(req.params.id).populate('customer');
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (status) {
      order.status = status;
      order.timeline.push({ status, date: new Date(), note });
    }
    
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    if (status === 'Delivered') {
      getIO().emit('notification', { type: 'order_delivered', message: `Order ${order.orderNumber} delivered!` });
      sendEmail((order.customer as any).email, 'Order Delivered', `Your order ${order.orderNumber} is delivered.`);
    }

    if (req.user) {
      await logActivity(req.user._id.toString(), 'Updated Order', 'Orders', `Order: ${order.orderNumber} updated`);
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    await order.deleteOne();
    if (req.user) await logActivity(req.user._id.toString(), 'Deleted Order', 'Orders', `Order: ${order.orderNumber}`);
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Order.aggregate([
      { $match: { orderDate: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id:        { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(analytics.map(item => ({
      date:   item._id,
      sales:  item.totalSales,
      orders: item.orderCount,
    })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
