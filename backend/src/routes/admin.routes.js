import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

// Protect all admin routes with authentication AND ADMIN role authorization
router.use(protect, authorizeRoles('ADMIN'));

// Equipment Verification & Management
router.get('/equipment/pending', adminController.getPendingEquipment);
router.patch('/equipment/:id/approve', adminController.approveEquipment);
router.patch('/equipment/:id/reject', adminController.rejectEquipment);
router.get('/equipment', adminController.getAllEquipment);

// System-wide Oversight
router.get('/borrow-requests', adminController.getAllBorrowRequests);
router.get('/returns', adminController.getAllReturns);
router.get('/feedback', adminController.getAllFeedback);
router.patch('/feedback/:id/status', adminController.updateFeedbackStatus);

// Operational Analytics & User Management
router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

export default router;
