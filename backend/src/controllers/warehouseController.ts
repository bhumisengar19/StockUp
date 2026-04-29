import { Request, Response } from 'express';
import { Warehouse } from '../models/Warehouse';
import { logActivity } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';

export const getWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search as string, $options: 'i' };
    }

    const warehouses = await Warehouse.find(query).sort({ createdAt: -1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, capacity, type } = req.body;
    const warehouse = await Warehouse.create({ name, location, capacity, type });
    
    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Created Warehouse', 'Warehouse', `Warehouse: ${name}`);
    }

    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Updated Warehouse', 'Warehouse', `Warehouse: ${warehouse.name}`);
    }

    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    await warehouse.deleteOne();

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Deleted Warehouse', 'Warehouse', `Warehouse: ${warehouse.name}`);
    }

    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

