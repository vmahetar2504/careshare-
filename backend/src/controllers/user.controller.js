import * as userService from '../services/user.service.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return successResponse(res, 200, 'Profile retrieved successfully.', { user: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const validatedData = updateProfileSchema.parse(req.body);
  const profileImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const updatedUser = await userService.updateProfile(req.user._id, validatedData, profileImagePath);
  return successResponse(res, 200, 'Profile updated successfully.', { user: updatedUser });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const result = await userService.changePassword(req.user._id, currentPassword, newPassword);
  return successResponse(res, 200, result.message, {});
});
