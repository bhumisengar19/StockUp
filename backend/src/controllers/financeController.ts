import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { PurchaseOrder } from '../models/PurchaseOrder';

export const getProfitLoss = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { status: { $ne: 'Cancelled' } };
    
    if (startDate && endDate) {
      query.orderDate = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    // 1. Calculate Revenue (Sales)
    const sales = await Order.aggregate([
      { $match: query },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // 2. Calculate COGS (Cost of Goods Sold)
    // We need to look at each item in each order and multiply by its product.costPrice
    const orders = await Order.find(query).populate('items.product', 'costPrice');
    let totalCOGS = 0;
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        totalCOGS += (item.product?.costPrice || 0) * item.quantity;
      });
    });

    // 3. Calculate Procurement Expenses (Optional - for total cash flow)
    const procurementQuery = { status: 'Received' };
    if (startDate && endDate) {
      (procurementQuery as any).receivedDate = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    const procurement = await PurchaseOrder.aggregate([
      { $match: procurementQuery },
      { $group: { _id: null, expense: { $sum: '$totalAmount' } } }
    ]);

    const revenue = sales[0]?.revenue || 0;
    const grossProfit = revenue - totalCOGS;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    res.json({
      revenue,
      totalCOGS,
      grossProfit,
      margin: margin.toFixed(2) + '%',
      orderCount: sales[0]?.count || 0,
      procurementExpense: procurement[0]?.expense || 0,
      netCashFlow: revenue - (procurement[0]?.expense || 0)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
