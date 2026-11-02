import Inspection from '../models/Inspection.js';
import Return from '../models/Return.js';
import Equipment from '../models/Equipment.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { createNotification } from './notification.service.js';

export const createInspection = async (inspectorId, userRole, data) => {
  if (userRole !== 'ADMIN') {
    throw new AppError('Only administrators or authorized staff can perform equipment inspections.', 403);
  }

  const { returnId, conditionBefore, conditionAfter, damageFound, damageDescription, estimatedRepairRequired, notes } =
    data;

  const returnRecord = await Return.findById(returnId)
    .populate('equipment')
    .populate('borrowRequest');

  if (!returnRecord) {
    throw new AppError('Return record not found.', 404);
  }

  if (returnRecord.status !== 'INSPECTION_PENDING') {
    throw new AppError(
      `Cannot inspect. Return record status is "${returnRecord.status}". Expected "INSPECTION_PENDING".`,
      400
    );
  }

  const isDamage = Boolean(damageFound) || Boolean(estimatedRepairRequired) || conditionAfter === 'DAMAGED';
  const inspectionStatus = isDamage ? 'DAMAGE_FOUND' : 'PASSED';

  const inspection = await Inspection.create({
    equipment: returnRecord.equipment._id,
    borrowRequest: returnRecord.borrowRequest._id,
    returnRecord: returnRecord._id,
    inspectedBy: inspectorId,
    conditionBefore: conditionBefore || returnRecord.returnCondition || returnRecord.equipment.condition,
    conditionAfter,
    damageFound: isDamage,
    damageDescription: isDamage ? damageDescription : null,
    estimatedRepairRequired: Boolean(estimatedRepairRequired),
    notes,
    status: inspectionStatus,
    inspectedAt: new Date(),
  });

  // Update equipment status based on inspection result
  const newAvailability = isDamage ? 'MAINTENANCE' : 'SANITIZATION';
  await Equipment.findByIdAndUpdate(returnRecord.equipment._id, {
    availabilityStatus: newAvailability,
    condition: conditionAfter,
  });

  // Notify owner
  await createNotification({
    user: returnRecord.owner,
    title: isDamage ? 'Equipment Inspection: Maintenance Required' : 'Equipment Inspection Passed',
    message: isDamage
      ? `Inspection for "${returnRecord.equipment.name}" reported damage (${damageDescription || 'Maintenance required'}). Moved to MAINTENANCE.`
      : `Inspection for "${returnRecord.equipment.name}" passed. Moved to SANITIZATION stage.`,
    type: 'INSPECTION',
    relatedEquipment: returnRecord.equipment._id,
    relatedBorrowRequest: returnRecord.borrowRequest._id,
  });

  return inspection;
};

export const getInspectionById = async (inspectionId, userId, userRole) => {
  const inspection = await Inspection.findById(inspectionId)
    .populate('equipment')
    .populate('inspectedBy', 'firstName lastName email')
    .populate('returnRecord')
    .populate('borrowRequest');

  if (!inspection) {
    throw new AppError('Inspection record not found.', 404);
  }

  return inspection;
};

export const updateInspection = async (inspectionId, inspectorId, userRole, updateData) => {
  if (userRole !== 'ADMIN') {
    throw new AppError('Only administrators can update inspection records.', 403);
  }

  const inspection = await Inspection.findById(inspectionId).populate('equipment');
  if (!inspection) {
    throw new AppError('Inspection record not found.', 404);
  }

  if (updateData.damageFound !== undefined) {
    inspection.damageFound = updateData.damageFound;
  }
  if (updateData.damageDescription !== undefined) {
    inspection.damageDescription = updateData.damageDescription;
  }
  if (updateData.conditionAfter) {
    inspection.conditionAfter = updateData.conditionAfter;
  }
  if (updateData.estimatedRepairRequired !== undefined) {
    inspection.estimatedRepairRequired = updateData.estimatedRepairRequired;
  }
  if (updateData.notes) {
    inspection.notes = updateData.notes;
  }

  // Recalculate status if condition or damage was updated
  const isDamage = inspection.damageFound || inspection.estimatedRepairRequired || inspection.conditionAfter === 'DAMAGED';
  inspection.status = isDamage ? 'DAMAGE_FOUND' : 'PASSED';
  await inspection.save();

  // If inspection now passed after maintenance/repair:
  const newAvailability = isDamage ? 'MAINTENANCE' : 'SANITIZATION';
  await Equipment.findByIdAndUpdate(inspection.equipment._id, {
    availabilityStatus: newAvailability,
    condition: inspection.conditionAfter,
  });

  return inspection;
};

export const getAllInspections = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }
  if (query.equipment) {
    filter.equipment = query.equipment;
  }

  const [inspections, total] = await Promise.all([
    Inspection.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images availabilityStatus')
      .populate('inspectedBy', 'firstName lastName email'),
    Inspection.countDocuments(filter),
  ]);

  return {
    inspections,
    pagination: buildPaginationMeta(total, page, limit),
  };
};
