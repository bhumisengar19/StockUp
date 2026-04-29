import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getSalesAnalytics, deleteOrder } from '../controllers/orderController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.route('/analytics').get(protect, getSalesAnalytics);

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

router.route('/:id')
  .delete(protect, deleteOrder);

export default router;
