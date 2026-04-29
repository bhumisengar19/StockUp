import express from 'express';
import { initiateReturn, completeReturn, getReturns } from '../controllers/returnController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReturns)
  .post(initiateReturn);

router.route('/:id/complete')
  .put(completeReturn);

export default router;
