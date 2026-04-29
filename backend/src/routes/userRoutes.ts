import express from 'express';
import { getUsers, updateUserRole, deleteUser, updateProfile } from '../controllers/userController';
import { protect } from '../middlewares/auth';
import { upload } from '../utils/cloudinary';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .put(upload.single('image'), updateProfile);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .put(updateUserRole)
  .delete(deleteUser);

export default router;
