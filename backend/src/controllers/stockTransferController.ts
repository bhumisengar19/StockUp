import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StockTransfer } from '../models/StockTransfer';
import { updateWarehouseStock } from './warehouseStockController';
import { AuthRequest } from '../middlewares/auth';

export const initiateTransfer = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { product, fromWarehouse, toWarehouse, quantity, notes } = req.body;
    
    if (fromWarehouse === toWarehouse) {
      throw new Error('Source and destination warehouses must be different');
    }

    const transferNumber = `TRF-${Date.now()}`;

    const transfer = new StockTransfer({
      transferNumber,
      product,
      fromWarehouse,
      toWarehouse,
      quantity,
      status: 'Pending Approval',
      user: req.user?._id,
      notes
    });

    // Deduct from source warehouse immediately (Hold)
    await updateWarehouseStock(product, fromWarehouse, -quantity, session);

    await transfer.save({ session });
    await session.commitTransaction();

    res.status(201).json(transfer);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const approveTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const transfer = await StockTransfer.findById(id);

    if (!transfer || transfer.status !== 'Pending Approval') {
      throw new Error('Invalid transfer status');
    }

    transfer.status = 'Approved';
    transfer.approver = req.user?._id;
    await transfer.save();

    res.json(transfer);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const completeTransfer = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const transfer = await StockTransfer.findById(id).session(session);

    if (!transfer || (transfer.status !== 'Approved' && transfer.status !== 'In Transit' && transfer.status !== 'Pending Approval')) {
      throw new Error('Invalid transfer status');
    }

    // Add to destination warehouse
    await updateWarehouseStock(
      transfer.product.toString(), 
      transfer.toWarehouse.toString(), 
      transfer.quantity, 
      session
    );

    transfer.status = 'Completed';
    transfer.receivedBy = req.user?._id;
    transfer.receivedDate = new Date();

    await transfer.save({ session });
    await session.commitTransaction();

    res.json(transfer);
  } catch (error: any) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getTransfers = async (req: Request, res: Response) => {
  try {
    const transfers = await StockTransfer.find()
      .populate('product', 'productName sku')
      .populate('fromWarehouse', 'name')
      .populate('toWarehouse', 'name')
      .populate('user', 'username')
      .populate('approver', 'username')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
