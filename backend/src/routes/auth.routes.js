import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, authController.resetPassword);

export default router;
