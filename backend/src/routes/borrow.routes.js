import { Router } from 'express';
import * as borrowController from '../controllers/borrow.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', borrowController.createBorrowRequest);
router.get('/my', borrowController.getMyBorrowRequests);
router.get('/received', borrowController.getReceivedBorrowRequests);
router.get('/:id', borrowController.getBorrowRequestById);

router.patch('/:id/approve', borrowController.approveBorrowRequest);
router.patch('/:id/reject', borrowController.rejectBorrowRequest);
router.patch('/:id/cancel', borrowController.cancelBorrowRequest);
router.patch('/:id/pickup', borrowController.pickupBorrowRequest);

export default router;
