import * as sanitizationService from '../services/sanitization.service.js';
import {
  createSanitizationSchema,
  completeSanitizationSchema,
} from '../validators/sanitization.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createSanitization = asyncHandler(async (req, res) => {
  const validatedData = createSanitizationSchema.parse(req.body);
  const sanitization = await sanitizationService.createSanitization(
    req.user._id,
    req.user.role,
    validatedData
  );
  return successResponse(
    res,
    201,
    'Sanitization process started successfully. Equipment set to SANITIZATION status.',
    { sanitization }
  );
});

export const completeSanitization = asyncHandler(async (req, res) => {
  const validatedData = completeSanitizationSchema.parse(req.body);
  const sanitization = await sanitizationService.completeSanitization(
    req.params.id,
    req.user._id,
    req.user.role,
    validatedData
  );
  return successResponse(
    res,
    200,
    'Sanitization marked as completed. Equipment is now AVAILABLE for community borrowing!',
    { sanitization }
  );
});

export const getSanitizationById = asyncHandler(async (req, res) => {
  const sanitization = await sanitizationService.getSanitizationById(req.params.id);
  return successResponse(res, 200, 'Sanitization details retrieved successfully.', {
    sanitization,
  });
});

export const getAllSanitizations = asyncHandler(async (req, res) => {
  const result = await sanitizationService.getAllSanitizations(req.query);
  return successResponse(res, 200, 'Sanitization logs retrieved successfully.', result);
});
