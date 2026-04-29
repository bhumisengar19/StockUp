import express from 'express';
import { getDashboard, getAnalytics, exportInventory, exportSales } from '../controllers/reportController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/export/inventory', exportInventory);
router.get('/export/sales', exportSales);

export default router;
