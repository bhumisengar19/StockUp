import express from 'express';
import { getStockByWarehouse, getStockByProduct } from '../controllers/warehouseStockController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.get('/warehouse/:warehouseId', getStockByWarehouse);
router.get('/product/:productId', getStockByProduct);

export default router;
