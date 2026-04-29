import express from 'express';
import { getActivityLogs } from '../controllers/activityController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.route('/')
  .get(protect, getActivityLogs);

export default router;
