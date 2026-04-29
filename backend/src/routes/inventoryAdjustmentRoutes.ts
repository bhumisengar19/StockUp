import express from 'express';
import { createAdjustment, getAdjustments } from '../controllers/inventoryAdjustmentController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAdjustments)
  .post(createAdjustment);

export default router;
