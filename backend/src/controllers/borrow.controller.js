import * as borrowService from '../services/borrow.service.js';
import { createBorrowRequestSchema, rejectBorrowRequestSchema } from '../validators/borrow.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createBorrowRequest = asyncHandler(async (req, res) => {
  const validatedData = createBorrowRequestSchema.parse(req.body);
  const borrowRequest = await borrowService.createBorrowRequest(req.user._id, validatedData);
  return successResponse(
    res,
    201,
    'Borrow request submitted successfully. The owner has been notified.',
    { borrowRequest }
  );
});

export const getMyBorrowRequests = asyncHandler(async (req, res) => {
  const result = await borrowService.getMyBorrowRequests(req.user._id, req.query);
  return successResponse(res, 200, 'Your borrow requests retrieved successfully.', result);
});

export const getReceivedBorrowRequests = asyncHandler(async (req, res) => {
  const result = await borrowService.getReceivedBorrowRequests(req.user._id, req.query);
  return successResponse(res, 200, 'Received borrow requests retrieved successfully.', result);
});

export const getBorrowRequestById = asyncHandler(async (req, res) => {
  const borrowRequest = await borrowService.getBorrowRequestById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return successResponse(res, 200, 'Borrow request details retrieved successfully.', {
    borrowRequest,
  });
});

export const approveBorrowRequest = asyncHandler(async (req, res) => {
  const updated = await borrowService.approveBorrowRequest(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return successResponse(
    res,
    200,
    'Borrow request approved successfully. Equipment marked as RESERVED.',
    { borrowRequest: updated }
  );
});

export const rejectBorrowRequest = asyncHandler(async (req, res) => {
  const { rejectionReason } = rejectBorrowRequestSchema.parse(req.body);
  const updated = await borrowService.rejectBorrowRequest(
    req.params.id,
    req.user._id,
    req.user.role,
    rejectionReason
  );
  return successResponse(res, 200, 'Borrow request rejected.', { borrowRequest: updated });
});

export const cancelBorrowRequest = asyncHandler(async (req, res) => {
  const updated = await borrowService.cancelBorrowRequest(req.params.id, req.user._id);
  return successResponse(res, 200, 'Borrow request cancelled successfully.', {
    borrowRequest: updated,
  });
});

export const pickupBorrowRequest = asyncHandler(async (req, res) => {
  const updated = await borrowService.pickupBorrowRequest(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return successResponse(
    res,
    200,
    'Equipment marked as picked up. Borrow period is now ACTIVE.',
    { borrowRequest: updated }
  );
});
