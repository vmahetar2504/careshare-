import * as adminService from '../services/admin.service.js';
import { z } from 'zod';
import { feedbackStatusSchema } from '../validators/feedback.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const rejectReasonSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters long'),
});

export const getPendingEquipment = asyncHandler(async (req, res) => {
  const result = await adminService.getPendingEquipment(req.query);
  return successResponse(res, 200, 'Pending equipment retrieved successfully.', result);
});

export const approveEquipment = asyncHandler(async (req, res) => {
  const equipment = await adminService.approveEquipment(req.params.id);
  return successResponse(
    res,
    200,
    'Equipment approved successfully. Status set to APPROVED and AVAILABLE.',
    { equipment }
  );
});

export const rejectEquipment = asyncHandler(async (req, res) => {
  const { rejectionReason } = rejectReasonSchema.parse(req.body);
  const equipment = await adminService.rejectEquipment(req.params.id, rejectionReason);
  return successResponse(res, 200, 'Equipment rejected successfully.', { equipment });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return successResponse(res, 200, 'Admin dashboard statistics retrieved successfully.', {
    stats,
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query);
  return successResponse(res, 200, 'Users retrieved successfully.', result);
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const result = await adminService.toggleUserStatus(req.params.id, req.user._id);
  return successResponse(res, 200, result.message, { user: result.user });
});

export const getAllBorrowRequests = asyncHandler(async (req, res) => {
  const result = await adminService.getAllBorrowRequests(req.query);
  return successResponse(res, 200, 'All borrow requests retrieved successfully.', result);
});

export const getAllReturns = asyncHandler(async (req, res) => {
  const result = await adminService.getAllReturns(req.query);
  return successResponse(res, 200, 'All equipment returns retrieved successfully.', result);
});

export const getAllEquipment = asyncHandler(async (req, res) => {
  const result = await adminService.getAllEquipment(req.query);
  return successResponse(res, 200, 'All equipment inventory retrieved successfully.', result);
});

export const getAllFeedback = asyncHandler(async (req, res) => {
  const result = await adminService.getAllFeedback(req.query);
  return successResponse(res, 200, 'Feedback list retrieved successfully.', result);
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = feedbackStatusSchema.parse(req.body);
  const feedback = await adminService.updateFeedbackStatus(req.params.id, status);
  return successResponse(res, 200, 'Feedback status updated successfully.', { feedback });
});
