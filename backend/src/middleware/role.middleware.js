import AppError from '../utils/AppError.js';

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Access denied. Role '${req.user.role}' is not authorized to perform this action.`, 403)
      );
    }
    next();
  };
};

export default authorizeRoles;
