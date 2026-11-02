import Return from '../models/Return.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Equipment from '../models/Equipment.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { createNotification } from './notification.service.js';

export const createReturnRequest = async (borrowerId, data) => {
  const { borrowRequestId, returnCondition, notes } = data;

  const borrowRequest = await BorrowRequest.findById(borrowRequestId).populate('equipment');
  if (!borrowRequest) {
    throw new AppError('Borrow request not found.', 404);
  }

  if (borrowRequest.borrower.toString() !== borrowerId.toString()) {
    throw new AppError('You can only initiate a return for your own borrow requests.', 403);
  }

  if (borrowRequest.status !== 'ACTIVE') {
    throw new AppError(
      `Cannot initiate return. Borrow request status is "${borrowRequest.status}". Only ACTIVE borrowings can be returned.`,
      400
    );
  }

  const existingReturn = await Return.findOne({
    borrowRequest: borrowRequestId,
    status: { $in: ['REQUESTED', 'RECEIVED', 'INSPECTION_PENDING'] },
  });

  if (existingReturn) {
    throw new AppError('A return process is already in progress for this borrow request.', 400);
  }

  const returnRecord = await Return.create({
    borrowRequest: borrowRequestId,
    equipment: borrowRequest.equipment._id,
    borrower: borrowerId,
    owner: borrowRequest.owner,
    returnCondition: returnCondition || 'GOOD',
    notes,
    status: 'REQUESTED',
    requestedAt: new Date(),
  });

  borrowRequest.status = 'RETURN_REQUESTED';
  await borrowRequest.save();

  // Notify owner
  await createNotification({
    user: borrowRequest.owner,
    title: 'Equipment Return Initiated',
    message: `The borrower has requested to return "${borrowRequest.equipment.name}". Please arrange handover.`,
    type: 'RETURN_REQUESTED',
    relatedEquipment: borrowRequest.equipment._id,
    relatedBorrowRequest: borrowRequest._id,
  });

  return returnRecord;
};

export const receiveReturn = async (returnId, userId, userRole, data) => {
  const returnRecord = await Return.findById(returnId)
    .populate('equipment')
    .populate('borrowRequest');

  if (!returnRecord) {
    throw new AppError('Return record not found.', 404);
  }

  const isOwner = returnRecord.owner.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('Only the equipment owner or an admin can confirm receipt of the return.', 403);
  }

  if (returnRecord.status !== 'REQUESTED') {
    throw new AppError(
      `Cannot mark received. Current return status is "${returnRecord.status}".`,
      400
    );
  }

  returnRecord.status = 'INSPECTION_PENDING';
  returnRecord.returnedAt = new Date();
  if (data.returnCondition) {
    returnRecord.returnCondition = data.returnCondition;
  }
  if (data.notes) {
    returnRecord.notes = data.notes;
  }
  await returnRecord.save();

  // Update borrow request
  await BorrowRequest.findByIdAndUpdate(returnRecord.borrowRequest._id, {
    status: 'COMPLETED',
    returnedAt: new Date(),
  });

  // Update equipment status to UNAVAILABLE until inspection and sanitization pass
  await Equipment.findByIdAndUpdate(returnRecord.equipment._id, {
    availabilityStatus: 'UNAVAILABLE',
  });

  // Notify borrower
  await createNotification({
    user: returnRecord.borrower,
    title: 'Equipment Return Received',
    message: `The owner has received "${returnRecord.equipment.name}". It is now scheduled for safety inspection.`,
    type: 'GENERAL',
    relatedEquipment: returnRecord.equipment._id,
    relatedBorrowRequest: returnRecord.borrowRequest._id,
  });

  return returnRecord;
};

export const getReturnById = async (returnId, userId, userRole) => {
  const returnRecord = await Return.findById(returnId)
    .populate('equipment')
    .populate('borrower', 'firstName lastName email phone')
    .populate('owner', 'firstName lastName email phone')
    .populate('borrowRequest');

  if (!returnRecord) {
    throw new AppError('Return record not found.', 404);
  }

  const isBorrower = returnRecord.borrower._id.toString() === userId.toString();
  const isOwner = returnRecord.owner._id.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isBorrower && !isOwner && !isAdmin) {
    throw new AppError('Unauthorized to view this return record.', 403);
  }

  return returnRecord;
};

export const getAllReturns = async (query = {}, userId = null, userRole = null) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  const isAdmin = userRole === 'ADMIN';
  if (!isAdmin && userId) {
    filter.$or = [{ borrower: userId }, { owner: userId }];
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images availabilityStatus')
      .populate('borrower', 'firstName lastName email phone')
      .populate('owner', 'firstName lastName email phone'),
    Return.countDocuments(filter),
  ]);

  return {
    returns,
    pagination: buildPaginationMeta(total, page, limit),
  };
};
