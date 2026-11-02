import { Router } from 'express';
import * as inspectionController from '../controllers/inspection.controller.js';
import protect from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

const router = Router();

router.use(protect);

router.get('/', authorizeRoles('ADMIN'), inspectionController.getAllInspections);
router.post('/', authorizeRoles('ADMIN'), inspectionController.createInspection);
router.get('/:id', inspectionController.getInspectionById);
router.patch('/:id', authorizeRoles('ADMIN'), inspectionController.updateInspection);

export default router;
