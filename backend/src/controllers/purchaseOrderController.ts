import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { updateWarehouseStock } from './warehouseStockController';
import { AuthRequest } from '../middlewares/auth';

export const createPurchaseOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { supplier, warehouse, items, notes, expectedDate } = req.body;
    
    const poNumber = `PO-${Date.now()}`;
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.costPrice), 0);

    const po = new PurchaseOrder({
      poNumber,
      supplier,
      warehouse,
      items,
      totalAmount,
      status: 'Draft',
      expectedDate,
      notes,
      user: req.user?._id
    });

    await po.save();
    res.status(201).json(po);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const receivePurchaseOrder = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { receivedItems } = req.body; // Array of { productId, quantity }

    const po = await PurchaseOrder.findById(id).session(session);
    if (!po || po.status === 'Received' || po.status === 'Cancelled') {
      throw new Error('Invalid PO status');
    }

    for (const item of receivedItems) {
      const poItem = po.items.find(i => i.product.toString() === item.productId);
      if (poItem) {
        poItem.receivedQuantity += item.quantity;
        // Update physical stock
        await updateWarehouseStock(item.productId, po.warehouse.toString(), item.quantity, session);
      }
    }

    // Check if fully received
    const allReceived = po.items.every(i => i.receivedQuantity >= i.quantity);
    po.status = allReceived ? 'Received' : 'Partial';
    if (allReceived) po.receivedDate = new Date();

    await po.save({ session });
    await session.commitTransaction();

    res.json(po);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier', 'supplierName')
      .populate('warehouse', 'name')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(pos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
