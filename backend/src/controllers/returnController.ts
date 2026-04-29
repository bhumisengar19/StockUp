import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Return } from '../models/Return';
import { updateWarehouseStock } from './warehouseStockController';
import { Order } from '../models/Order';
import { AuthRequest } from '../middlewares/auth';

export const initiateReturn = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, productId, quantity, reason } = req.body;
    
    const returnNumber = `RTN-${Date.now()}`;
    const returnObj = new Return({
      returnNumber,
      order: orderId,
      product: productId,
      quantity,
      reason,
      status: 'Requested',
      user: req.user?._id
    });

    await returnObj.save();
    res.status(201).json(returnObj);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const completeReturn = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, refundAmount, warehouseId } = req.body;

    const returnObj = await Return.findById(id).session(session);
    if (!returnObj || returnObj.status === 'Restocked' || returnObj.status === 'Damaged') {
      throw new Error('Invalid return status or already processed');
    }

    if (status === 'Restocked' && warehouseId) {
      // Put items back in inventory
      await updateWarehouseStock(returnObj.product.toString(), warehouseId, returnObj.quantity, session);
    }

    returnObj.status = status;
    returnObj.refundAmount = refundAmount || 0;
    
    // Update Order Status to include 'Returned' if needed
    const order = await Order.findById(returnObj.order).session(session);
    if (order) {
       order.status = 'Returned';
       order.timeline.push({ status: 'Returned', date: new Date(), note: `Return #${returnObj.returnNumber} processed` });
       await order.save({ session });
    }

    await returnObj.save({ session });
    await session.commitTransaction();

    res.json(returnObj);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getReturns = async (req: Request, res: Response) => {
  try {
    const returns = await Return.find()
      .populate('order', 'orderNumber')
      .populate('product', 'productName sku')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
