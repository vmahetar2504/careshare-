import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import AppError from './AppError.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please login again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please login again.', 401);
    }
    throw new AppError('Token verification failed.', 401);
  }
};

export const setCookieToken = (res, token) => {
  const isProduction = config.nodeEnv === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearCookieToken = (res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
