import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import protect from '../middleware/auth.middleware.js';
import { uploadProfileImage } from '../middleware/upload.middleware.js';

const router = Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', uploadProfileImage, userController.updateProfile);
router.patch('/change-password', userController.changePassword);

export default router;
