import AppError from '../utils/AppError.js';
import { config } from '../config/env.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid value for ${err.path}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const message = field
    ? `A record with this ${field} already exists.`
    : 'A record with this value already exists.';
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  const error = new AppError(message, 422);
  error.errors = errors;
  return error;
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again.', 401);

const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large. Maximum allowed size is 5MB.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum 5 images allowed.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError(`Unexpected field: ${err.field || 'file'}`, 400);
  }
  return new AppError(`File upload error: ${err.message}`, 400);
};

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Handle specific known error types
  let error = err;

  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  if (/^(Mongo|Mongoose)/.test(err.name || '')) {
    error = new AppError('Database temporarily unavailable.', 503);
  }
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (err.name === 'MulterError') error = handleMulterError(err);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errors = error.errors || [];

  if (config.nodeEnv === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
      stack: error.stack,
    });
  }

  // Production mode: do not leak implementation details or stack traces
  if (error.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
    });
  }

  console.error('UNEXPECTED SERVER ERROR:', error);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    errors: [],
  });
};

export default errorMiddleware;
