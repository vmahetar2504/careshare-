import * as returnService from '../services/return.service.js';
import { createReturnRequestSchema, receiveReturnSchema } from '../validators/return.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createReturnRequest = asyncHandler(async (req, res) => {
  const validatedData = createReturnRequestSchema.parse(req.body);
  const returnRecord = await returnService.createReturnRequest(req.user._id, validatedData);
  return successResponse(
    res,
    201,
    'Return request submitted successfully. The owner has been notified.',
    { returnRecord }
  );
});

export const receiveReturn = asyncHandler(async (req, res) => {
  const validatedData = receiveReturnSchema.parse(req.body);
  const updated = await returnService.receiveReturn(
    req.params.id,
    req.user._id,
    req.user.role,
    validatedData
  );
  return successResponse(
    res,
    200,
    'Equipment return received successfully. Status updated to INSPECTION_PENDING.',
    { returnRecord: updated }
  );
});

export const getReturnById = asyncHandler(async (req, res) => {
  const returnRecord = await returnService.getReturnById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return successResponse(res, 200, 'Return details retrieved successfully.', { returnRecord });
});

export const getAllReturns = asyncHandler(async (req, res) => {
  const result = await returnService.getAllReturns(req.query, req.user._id, req.user.role);
  return successResponse(res, 200, 'Returns retrieved successfully.', result);
});
