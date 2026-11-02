import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer authorization header if cookie is not present (for API clients / tests)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('You are not logged in. Please login to access this resource.', 401);
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id).select(
    '-password -passwordResetToken -passwordResetExpires'
  );

  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 401);
  }

  req.user = user;
  next();
});

export default protect;
