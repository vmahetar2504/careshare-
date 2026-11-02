import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', notificationController.getUserNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
