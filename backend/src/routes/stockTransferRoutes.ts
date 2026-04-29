import express from 'express';
import { initiateTransfer, completeTransfer, getTransfers, approveTransfer } from '../controllers/stockTransferController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransfers)
  .post(initiateTransfer);

router.route('/:id/approve')
  .put(approveTransfer);

router.route('/:id/complete')
  .put(completeTransfer);

export default router;
