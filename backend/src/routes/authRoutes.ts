import express from 'express';
import { signupUser, loginUser, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { validateSignup, validateLogin } from '../validators/authValidator';

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/signup', validateSignup, signupUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', validateLogin, loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve current authenticated user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

export default router;

