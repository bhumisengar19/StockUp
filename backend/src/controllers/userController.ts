import { Request, Response } from 'express';
import { User } from '../models/User';
import { logActivity } from '../utils/logger';
import { AuthRequest } from '../middlewares/auth';

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, isActive } = req.body;
  const validRoles = ['admin', 'manager', 'staff', 'viewer'];

  if (role && !validRoles.includes(role)) {
    res.status(400).json({ message: 'Invalid role' });
    return;
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    await user.save();

    if (req.user) {
      await logActivity(
        (req.user._id as any).toString(), 
        'Updated User Role', 
        'Users', 
        `User ${user.username} role updated to ${role}`
      );
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Prevent deleting self
    if (user._id.toString() === req.user!._id.toString()) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    await user.deleteOne();

    if (req.user) {
      await logActivity(
        (req.user._id as any).toString(), 
        'Deleted User', 
        'Users', 
        `User ${user.username} deleted`
      );
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user!._id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (req.file) {
      user.profileImage = req.file.path;
    }

    await user.save();
    
    // Return user without password
    const updatedUser = user.toObject();
    delete (updatedUser as any).password;

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

