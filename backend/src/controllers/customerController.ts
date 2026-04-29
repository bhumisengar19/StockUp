import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { logActivity } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search as string, $options: 'i' } },
        { email: { $regex: req.query.search as string, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Customer.countDocuments(query);

    res.json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.create(req.body);
    
    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Created Customer', 'Customer', `Customer: ${customer.name}`);
    }

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Updated Customer', 'Customer', `Customer: ${customer.name}`);
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    if (req.user) {
      await logActivity((req.user._id as any).toString(), 'Deleted Customer', 'Customer', `Customer: ${customer.name}`);
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
