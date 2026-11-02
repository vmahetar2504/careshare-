import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import AppError from '../utils/AppError.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user.toSafeObject();
};

export const updateProfile = async (userId, updateData, profileImagePath = null) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'pincode'];
  const updatePayload = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updatePayload[field] = updateData[field];
    }
  });

  if (profileImagePath) {
    updatePayload.profileImage = profileImagePath;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError('User not found.', 404);
  }

  return updatedUser.toSafeObject();
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isCurrentPasswordCorrect = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordCorrect) {
    throw new AppError('The current password provided is incorrect.', 400);
  }

  user.password = await hashPassword(newPassword);
  await user.save({ validateBeforeSave: false });

  return { message: 'Password updated successfully.' };
};
