import * as inspectionService from '../services/inspection.service.js';
import { createInspectionSchema, updateInspectionSchema } from '../validators/inspection.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createInspection = asyncHandler(async (req, res) => {
  const validatedData = createInspectionSchema.parse(req.body);
  const inspection = await inspectionService.createInspection(
    req.user._id,
    req.user.role,
    validatedData
  );
  return successResponse(
    res,
    201,
    `Inspection recorded successfully. Status: ${inspection.status}.`,
    { inspection }
  );
});

export const getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspectionById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return successResponse(res, 200, 'Inspection details retrieved successfully.', { inspection });
});

export const updateInspection = asyncHandler(async (req, res) => {
  const validatedData = updateInspectionSchema.parse(req.body);
  const updated = await inspectionService.updateInspection(
    req.params.id,
    req.user._id,
    req.user.role,
    validatedData
  );
  return successResponse(res, 200, 'Inspection record updated successfully.', {
    inspection: updated,
  });
});

export const getAllInspections = asyncHandler(async (req, res) => {
  const result = await inspectionService.getAllInspections(req.query);
  return successResponse(res, 200, 'Inspections list retrieved successfully.', result);
});
