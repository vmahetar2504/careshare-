import * as equipmentService from '../services/equipment.service.js';
import { createEquipmentSchema, updateEquipmentSchema } from '../validators/equipment.validator.js';
import { successResponse } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createEquipment = asyncHandler(async (req, res) => {
  // Handle nested location if sent as string or object in multipart form
  let bodyData = { ...req.body };
  if (typeof bodyData.location === 'string') {
    try {
      bodyData.location = JSON.parse(bodyData.location);
    } catch {
      // Keep as is if parsing fails
    }
  }

  const validatedData = createEquipmentSchema.parse(bodyData);
  const imagePaths = req.files && req.files.length > 0 ? req.files.map((f) => `/uploads/${f.filename}`) : [];

  const equipment = await equipmentService.createEquipment(req.user._id, validatedData, imagePaths);

  return successResponse(
    res,
    201,
    'Equipment listed successfully and submitted for admin verification.',
    { equipment }
  );
});

export const getAllEquipment = asyncHandler(async (req, res) => {
  const result = await equipmentService.getAllEquipment(req.query, req.user || null);
  return successResponse(res, 200, 'Equipment list retrieved successfully.', result);
});

export const getEquipmentById = asyncHandler(async (req, res) => {
  const equipment = await equipmentService.getEquipmentById(req.params.id, req.user || null);
  return successResponse(res, 200, 'Equipment details retrieved successfully.', { equipment });
});

export const updateEquipment = asyncHandler(async (req, res) => {
  let bodyData = { ...req.body };
  if (typeof bodyData.location === 'string') {
    try {
      bodyData.location = JSON.parse(bodyData.location);
    } catch {
      // Keep as is
    }
  }

  const validatedData = updateEquipmentSchema.parse(bodyData);
  const newImagePaths = req.files && req.files.length > 0 ? req.files.map((f) => `/uploads/${f.filename}`) : [];

  const updated = await equipmentService.updateEquipment(
    req.params.id,
    req.user._id,
    req.user.role,
    validatedData,
    newImagePaths
  );

  return successResponse(res, 200, 'Equipment updated successfully.', { equipment: updated });
});

export const deleteEquipment = asyncHandler(async (req, res) => {
  const result = await equipmentService.deleteEquipment(req.params.id, req.user._id, req.user.role);
  return successResponse(res, 200, result.message, {});
});

export const getMyEquipment = asyncHandler(async (req, res) => {
  const result = await equipmentService.getMyEquipment(req.user._id, req.query);
  return successResponse(res, 200, 'Your equipment listings retrieved successfully.', result);
});
