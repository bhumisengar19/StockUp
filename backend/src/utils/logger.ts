import { ActivityLog } from '../models/ActivityLog';

export const logActivity = async (
  userId: string,
  action: string,
  module: string,
  details?: string
) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
      details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
