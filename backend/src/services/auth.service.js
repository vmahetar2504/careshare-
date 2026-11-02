import User from '../models/User.js';
import { hashPassword, comparePassword, generateResetToken, hashToken } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import AppError from '../utils/AppError.js';
import { config } from '../config/env.js';

export const register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const hashedPassword = await hashPassword(userData.password);

  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
    email: userData.email.toLowerCase(),
    role: 'USER',
    isActive: true,
  });

  const token = generateToken({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  return {
    user: newUser.toSafeObject(),
    token,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    user: user.toSafeObject(),
    token,
  };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return friendly generic message to prevent email enumeration
    return {
      message: 'If an account exists with that email, a password reset token has been generated.',
    };
  }

  const { resetToken, hashedToken, expiresAt } = generateResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;
  await user.save({ validateBeforeSave: false });

  const responseData = {
    message: 'If an account exists with that email, a password reset token has been generated.',
  };

  // Safe development mechanism for testing reset flow without sending external emails
  if (config.nodeEnv === 'development') {
    responseData.devResetToken = resetToken;
    responseData.devResetUrl = `${config.clientUrl}/reset-password/${resetToken}`;
  }

  return responseData;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400);
  }

  user.password = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return {
    message: 'Password has been successfully reset. You can now login with your new password.',
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user.toSafeObject();
};
