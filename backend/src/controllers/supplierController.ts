import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier';
import { logActivity } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.search) {
      query.supplierName = { $regex: req.query.search as string, $options: 'i' };
    }

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.create(req.body);
    
    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Created Supplier', 'Supplier', `Supplier: ${supplier.supplierName}`);
    }

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Updated Supplier', 'Supplier', `Supplier: ${supplier.supplierName}`);
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Deleted Supplier', 'Supplier', `Supplier: ${supplier.supplierName}`);
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
