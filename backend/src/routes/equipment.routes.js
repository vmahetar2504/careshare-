import { Router } from 'express';
import * as equipmentController from '../controllers/equipment.controller.js';
import protect from '../middleware/auth.middleware.js';
import { uploadEquipmentImages } from '../middleware/upload.middleware.js';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

const router = Router();

// Optional authentication middleware for public endpoints to identify user if logged in
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select(
        '-password -passwordResetToken -passwordResetExpires'
      );
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // If token is expired or invalid, continue as an unauthenticated guest
  }
  next();
};

router.get('/', optionalAuth, equipmentController.getAllEquipment);
router.get('/my/listings', protect, equipmentController.getMyEquipment);
router.get('/:id', optionalAuth, equipmentController.getEquipmentById);

router.post('/', protect, uploadEquipmentImages, equipmentController.createEquipment);
router.put('/:id', protect, uploadEquipmentImages, equipmentController.updateEquipment);
router.delete('/:id', protect, equipmentController.deleteEquipment);

export default router;
