import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', feedbackController.submitFeedback);
router.get('/my', feedbackController.getMyFeedback);

export default router;
