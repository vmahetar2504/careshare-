import { Router } from 'express';
import * as returnController from '../controllers/return.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', returnController.createReturnRequest);
router.get('/', returnController.getAllReturns);
router.get('/:id', returnController.getReturnById);
router.patch('/:id/receive', returnController.receiveReturn);

export default router;
