import express from 'express';
import { getProfitLoss } from '../controllers/financeController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.get('/profit-loss', protect, getProfitLoss);

export default router;
