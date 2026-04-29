import express from 'express';
import {
  getProducts,
  getLowStockProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect } from '../middlewares/auth';

import { upload } from '../utils/cloudinary';

const router = express.Router();

router.route('/low-stock').get(protect, getLowStockProducts);

router.route('/')
  .get(protect, getProducts)
  .post(protect, upload.single('image'), createProduct);

router.route('/:id')
  .put(protect, upload.single('image'), updateProduct)
  .delete(protect, deleteProduct);

export default router;
