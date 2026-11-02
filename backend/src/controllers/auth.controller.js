import * as authService from '../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import { setCookieToken, clearCookieToken } from '../utils/jwt.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const result = await authService.register(validatedData);

  setCookieToken(res, result.token);

  return successResponse(res, 201, 'Registration successful. Welcome to CareShare!', {
    user: result.user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);

  setCookieToken(res, result.token);

  return successResponse(res, 200, 'Login successful. Welcome back!', {
    user: result.user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  clearCookieToken(res);
  return successResponse(res, 200, 'Logged out successfully.', {});
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  return successResponse(res, 200, 'Current user profile fetched successfully.', { user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await authService.forgotPassword(email);
  return successResponse(res, 200, result.message, result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = resetPasswordSchema.parse(req.body);
  const result = await authService.resetPassword(req.params.token, password);
  return successResponse(res, 200, result.message, {});
});
