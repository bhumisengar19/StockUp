import express from 'express';
import { createPurchaseOrder, receivePurchaseOrder, getPurchaseOrders } from '../controllers/purchaseOrderController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/:id/receive')
  .put(receivePurchaseOrder);

export default router;
