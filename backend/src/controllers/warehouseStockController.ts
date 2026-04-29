import { Request, Response } from 'express';
import { WarehouseStock } from '../models/WarehouseStock';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

export const getStockByWarehouse = async (req: Request, res: Response) => {
  try {
    const { warehouseId } = req.params;
    const stock = await WarehouseStock.find({ warehouse: warehouseId })
      .populate('product', 'productName sku price quantity');
    res.json(stock);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const stock = await WarehouseStock.find({ product: productId })
      .populate('warehouse', 'name location');
    res.json(stock);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update stock in a specific warehouse
 * This is a low-level operation usually called by other controllers (Orders, POs)
 */
export const updateWarehouseStock = async (
  productId: string, 
  warehouseId: string, 
  quantityDelta: number,
  session?: mongoose.ClientSession
) => {
  let stock = await WarehouseStock.findOne({ product: productId, warehouse: warehouseId }).session(session || null);
  
  if (!stock) {
    stock = new WarehouseStock({
      product: productId,
      warehouse: warehouseId,
      quantity: 0
    });
  }

  stock.quantity += quantityDelta;
  
  if (stock.quantity < 0) {
    throw new Error('Insufficient stock in warehouse');
  }

  await stock.save({ session });

  // Sync total quantity in Product model
  const totalStock = await WarehouseStock.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$product', total: { $sum: '$quantity' } } }
  ]).session(session || null);

  await Product.findByIdAndUpdate(
    productId, 
    { quantity: totalStock[0]?.total || 0 }, 
    { session }
  );

  return stock;
};
