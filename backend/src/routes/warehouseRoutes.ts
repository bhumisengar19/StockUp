import express from 'express';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../controllers/warehouseController';
import { protect } from '../middlewares/auth';


const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .put(updateWarehouse)
  .delete(deleteWarehouse);

export default router;
