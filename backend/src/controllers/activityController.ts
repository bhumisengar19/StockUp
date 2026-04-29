import { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.module) {
      query.module = req.query.module;
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'username email role')
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });

    const total = await ActivityLog.countDocuments(query);

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
