import Sanitization from '../models/Sanitization.js';
import Inspection from '../models/Inspection.js';
import Equipment from '../models/Equipment.js';
import Return from '../models/Return.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { createNotification } from './notification.service.js';

export const createSanitization = async (performerId, userRole, data) => {
  if (userRole !== 'ADMIN') {
    throw new AppError('Only administrators or authorized staff can log sanitization operations.', 403);
  }

  const { inspectionId, method, notes } = data;

  const inspection = await Inspection.findById(inspectionId).populate('equipment');
  if (!inspection) {
    throw new AppError('Inspection record not found.', 404);
  }

  if (inspection.status !== 'PASSED') {
    throw new AppError(
      `Cannot sanitize equipment that has not passed inspection (Current inspection status: "${inspection.status}"). Any damage or repair must be resolved first.`,
      400
    );
  }

  const existingSanitization = await Sanitization.findOne({
    inspection: inspectionId,
    status: { $in: ['PENDING', 'IN_PROGRESS'] },
  });

  if (existingSanitization) {
    throw new AppError('A sanitization process is already in progress for this inspection.', 400);
  }

  const sanitization = await Sanitization.create({
    equipment: inspection.equipment._id,
    inspection: inspection._id,
    performedBy: performerId,
    method,
    notes,
    status: 'IN_PROGRESS',
  });

  await Equipment.findByIdAndUpdate(inspection.equipment._id, {
    availabilityStatus: 'SANITIZATION',
  });

  return sanitization;
};

export const completeSanitization = async (sanitizationId, performerId, userRole, data = {}) => {
  if (userRole !== 'ADMIN') {
    throw new AppError('Only administrators or authorized staff can complete sanitization.', 403);
  }

  const sanitization = await Sanitization.findById(sanitizationId)
    .populate('equipment')
    .populate('inspection');

  if (!sanitization) {
    throw new AppError('Sanitization record not found.', 404);
  }

  if (sanitization.status === 'COMPLETED') {
    throw new AppError('This sanitization record is already marked as completed.', 400);
  }

  // Safety check: ensure inspection has passed
  if (sanitization.inspection && sanitization.inspection.status !== 'PASSED') {
    throw new AppError('Equipment cannot be made AVAILABLE because its inspection status is not PASSED.', 400);
  }

  sanitization.status = 'COMPLETED';
  sanitization.sanitizedAt = new Date();
  if (data.notes) {
    sanitization.notes = sanitization.notes ? `${sanitization.notes}\n${data.notes}` : data.notes;
  }
  await sanitization.save();

  // Make equipment AVAILABLE again!
  const equipment = await Equipment.findByIdAndUpdate(
    sanitization.equipment._id,
    { availabilityStatus: 'AVAILABLE' },
    { new: true }
  );

  // Mark the related Return record as COMPLETED
  if (sanitization.inspection.returnRecord) {
    await Return.findByIdAndUpdate(sanitization.inspection.returnRecord, {
      status: 'COMPLETED',
    });
  }

  // Notify owner
  if (equipment) {
    await createNotification({
      user: equipment.owner,
      title: 'Equipment Sanitized & Available',
      message: `Your equipment "${equipment.name}" has completed sanitization and is now restored to AVAILABLE status for community borrowing.`,
      type: 'SANITIZATION',
      relatedEquipment: equipment._id,
    });
  }

  return sanitization;
};

export const getSanitizationById = async (sanitizationId) => {
  const sanitization = await Sanitization.findById(sanitizationId)
    .populate('equipment')
    .populate('inspection')
    .populate('performedBy', 'firstName lastName email');

  if (!sanitization) {
    throw new AppError('Sanitization record not found.', 404);
  }

  return sanitization;
};

export const getAllSanitizations = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  const [sanitizations, total] = await Promise.all([
    Sanitization.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images availabilityStatus')
      .populate('performedBy', 'firstName lastName email'),
    Sanitization.countDocuments(filter),
  ]);

  return {
    sanitizations,
    pagination: buildPaginationMeta(total, page, limit),
  };
};
