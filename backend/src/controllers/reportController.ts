import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { generatePDFReport } from '../utils/pdf';
import { generateExcelReport } from '../utils/excel';

// Advanced Dashboard
export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalOrders   = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });

    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      status: 'active'
    }).select('productName category quantity lowStockThreshold');

    const products = await Product.find({ status: 'active' }, 'price quantity');
    const totalStockValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 0), 0);

    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Today's Sales
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaySales = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);

    // Revenue Trends (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders: await Order.countDocuments({ status: 'Delivered' }),
      lowStockCount: lowStockProducts.length,
      totalStockValue,
      todaySales: todaySales[0]?.totalSales || 0,
      recentRevenue: recentRevenue[0]?.total || 0,
      lowStockProducts,
      categoryStats: categoryStats.map(c => ({ name: c._id || 'Uncategorized', value: c.count }))
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Analytics Data for Charts
export const getAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const productActivity = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      salesTrend: salesTrend.map(s => ({ month: s._id, sales: s.sales, orders: s.orders })),
      productActivity: productActivity.map(p => ({ category: p._id, count: p.count }))
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Simple CSV Generator
const generateCSV = (res: Response, filename: string, data: any[], headers: string[]) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
  
  const headerRow = headers.join(',') + '\n';
  const rows = data.map(item => {
    return Object.values(item).map(val => `"${val}"`).join(',');
  }).join('\n');
  
  res.status(200).send(headerRow + rows);
};

// Exports
export const exportInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const format = req.query.format as string || 'pdf';
    const products = await Product.find().lean();
    
    const formattedData = products.map(p => ({
      product: p.productName,
      sku: p.sku,
      category: p.category,
      price: p.price,
      quantity: p.quantity,
      status: p.quantity <= p.lowStockThreshold ? 'Low Stock' : 'OK'
    }));

    if (format === 'csv') {
      generateCSV(res, 'Inventory_Report', formattedData, ['Product', 'SKU', 'Category', 'Price', 'Quantity', 'Status']);
    } else if (format === 'excel') {
      const cols = [
        { header: 'Product Name', key: 'product' },
        { header: 'SKU', key: 'sku' },
        { header: 'Category', key: 'category' },
        { header: 'Price', key: 'price' },
        { header: 'Quantity', key: 'quantity' },
        { header: 'Status', key: 'status' }
      ];
      await generateExcelReport(res, 'Inventory_Report', formattedData, cols);
    } else {
      generatePDFReport(res, 'Inventory Report', formattedData, ['Product', 'SKU', 'Category', 'Price', 'Quantity', 'Status']);
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


export const exportSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const format = req.query.format as string || 'pdf';
    const orders = await Order.find().populate('customer').lean();
    
    const formattedData = orders.map(o => ({
      order: o.orderNumber,
      customer: (o.customer as any)?.name || 'N/A',
      amount: o.totalAmount,
      status: o.status,
      date: new Date(o.createdAt).toLocaleDateString()
    }));

    if (format === 'excel') {
      const cols = [
        { header: 'Order #', key: 'order' },
        { header: 'Customer', key: 'customer' },
        { header: 'Amount ($)', key: 'amount' },
        { header: 'Status', key: 'status' },
        { header: 'Date', key: 'date' }
      ];
      await generateExcelReport(res, 'Sales_Report', formattedData, cols);
    } else {
      generatePDFReport(res, 'Sales Report', formattedData, ['Order', 'Customer', 'Amount', 'Status', 'Date']);
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

