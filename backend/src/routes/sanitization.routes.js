import { Router } from 'express';
import * as sanitizationController from '../controllers/sanitization.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);

router.get('/', authorizeRoles('ADMIN'), sanitizationController.getAllSanitizations);
router.post('/', authorizeRoles('ADMIN'), sanitizationController.createSanitization);
router.get('/:id', authorizeRoles('ADMIN'), sanitizationController.getSanitizationById);
router.patch('/:id/complete', authorizeRoles('ADMIN'), sanitizationController.completeSanitization);

export default router;
