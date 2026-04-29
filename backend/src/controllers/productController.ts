import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { logActivity } from '../utils/logger';
import { generateQRCode } from '../utils/barcode';
import { AuthRequest } from '../middlewares/auth';
import { getIO } from '../sockets';

/**
 * Fetches all products with optional filtering and pagination.
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { status: { $ne: 'archived' } };
    if (req.query.category) query.category = req.query.category;
    if (req.query.subcategory) query.subcategory = req.query.subcategory;
    if (req.query.status) query.status = req.query.status;
    
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }

    if (req.query.stockStatus) {
      if (req.query.stockStatus === 'inStock') query.quantity = { $gt: 0 };
      if (req.query.stockStatus === 'outOfStock') query.quantity = 0;
      if (req.query.stockStatus === 'lowStock') query.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }
    
    if (req.query.search) {
      query.$or = [
        { productName: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .skip(skip).limit(limit).sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a list of products that have fallen below their minimum stock threshold.
 */
export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Creates a new product, generates associated metadata (SKU/QR), and logs the activity.
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    
    // Auto-generate SKU if not provided
    if (!productData.sku) {
      productData.sku = 'SKU-' + Date.now().toString().slice(-8).toUpperCase();
    }

    // Generate QR Code base on SKU
    productData.qrCode = await generateQRCode(productData.sku);
    
    if (req.file) {
      productData.imageUrl = req.file.path;
    }

    const product = await Product.create(productData);

    if (req.user) {
      await logActivity(req.user._id.toString(), 'Created Product', 'Products', `Product: ${product.productName}`);
    }

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Updates an existing product's details and regenerates barcodes if necessary.
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      productData.imageUrl = req.file.path;
    }

    // Regenerate QR if SKU changed
    if (productData.sku) {
      productData.qrCode = await generateQRCode(productData.sku);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (req.user) {
      await logActivity(req.user._id.toString(), 'Updated Product', 'Products', `Product: ${product.productName}`);
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Archives a product (soft delete) to preserve historical data.
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
       res.status(404).json({ message: 'Product not found' });
       return;
    }

    // Soft delete logic
    product.status = 'archived';
    await product.save();

    if (req.user) {
      await logActivity(req.user._id.toString(), 'Archived Product', 'Products', `Product: ${product.productName}`);
    }

    res.json({ message: 'Product archived successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
