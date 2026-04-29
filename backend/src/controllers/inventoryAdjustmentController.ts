import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { InventoryAdjustment } from '../models/InventoryAdjustment';
import { updateWarehouseStock } from './warehouseStockController';
import { AuthRequest } from '../middlewares/auth';

export const createAdjustment = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, warehouse, quantity, type, reason } = req.body;

    const adjustment = new InventoryAdjustment({
      product,
      warehouse,
      quantity,
      type,
      reason,
      user: req.user?._id
    });

    // Update physical stock (quantity can be negative for loss/damage)
    await updateWarehouseStock(product, warehouse, quantity, session);

    await adjustment.save({ session });
    await session.commitTransaction();

    res.status(201).json(adjustment);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getAdjustments = async (req: Request, res: Response) => {
  try {
    const adjustments = await InventoryAdjustment.find()
      .populate('product', 'productName sku')
      .populate('warehouse', 'name')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
