import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 45 * 60 * 1000, // 45 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 45 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 45 * 60 * 1000, // 45 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 45 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
