import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { logActivity } from '../utils/logger';
import { config } from '../config/config';

const generateToken = (id: string, email: string, role: string) =>
  jwt.sign({ id, email, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedUsername = username?.trim();

    const exists = await User.findOne({ 
      $or: [
        { email: normalizedEmail }, 
        { username: normalizedUsername }
      ] 
    });

    if (exists) {
      res.status(400).json({ message: 'User already exists with that email or username' });
      return;
    }

    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // All new users are registered as administrators in this single-admin system
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin', 
    });

    await logActivity((user._id as any).toString(), 'Signed Up', 'Auth', `New user: ${username}`);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken((user._id as any).toString(), user.email, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Support login via either email or username
    const loginIdentifier = email?.trim();
    const normalizedEmail = loginIdentifier?.toLowerCase();

    const user = await User.findOne({ 
      $or: [
        { email: normalizedEmail }, 
        { username: loginIdentifier }
      ] 
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ message: 'Account is disabled' });
      return;
    }

    await logActivity((user._id as any).toString(), 'Logged In', 'Auth');

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken((user._id as any).toString(), user.email, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
