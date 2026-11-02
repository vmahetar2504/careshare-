import BorrowRequest from '../models/BorrowRequest.js';
import Equipment from '../models/Equipment.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { createNotification } from './notification.service.js';

export const createBorrowRequest = async (borrowerId, data) => {
  const { equipmentId, requestedFrom, requestedUntil, reason, message } = data;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  if (equipment.verificationStatus !== 'APPROVED') {
    throw new AppError('Only approved equipment can be borrowed.', 400);
  }

  if (equipment.availabilityStatus !== 'AVAILABLE') {
    throw new AppError(
      `This equipment is currently not available for borrowing (Current status: ${equipment.availabilityStatus}).`,
      400
    );
  }

  if (equipment.owner.toString() === borrowerId.toString()) {
    throw new AppError('You cannot borrow your own equipment.', 400);
  }

  const fromDate = new Date(requestedFrom);
  const untilDate = new Date(requestedUntil);

  if (fromDate >= untilDate) {
    throw new AppError('The start date must be strictly before the end date.', 400);
  }

  // Prevent overlapping active or approved borrow periods
  const overlappingRequest = await BorrowRequest.findOne({
    equipment: equipmentId,
    status: { $in: ['APPROVED', 'ACTIVE'] },
    $or: [
      {
        requestedFrom: { $lte: untilDate },
        requestedUntil: { $gte: fromDate },
      },
    ],
  });

  if (overlappingRequest) {
    throw new AppError(
      'This equipment is already reserved or active during the requested dates.',
      400
    );
  }

  const borrowRequest = await BorrowRequest.create({
    equipment: equipmentId,
    borrower: borrowerId,
    owner: equipment.owner,
    requestedFrom: fromDate,
    requestedUntil: untilDate,
    reason,
    message,
    status: 'PENDING',
  });

  // Notify owner
  await createNotification({
    user: equipment.owner,
    title: 'New Borrow Request',
    message: `You have received a new borrow request for "${equipment.name}".`,
    type: 'BORROW_REQUEST',
    relatedEquipment: equipment._id,
    relatedBorrowRequest: borrowRequest._id,
  });

  return borrowRequest;
};

export const getMyBorrowRequests = async (borrowerId, query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { borrower: borrowerId };

  if (query.status) {
    filter.status = query.status;
  }

  const [requests, total] = await Promise.all([
    BorrowRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images location availabilityStatus condition')
      .populate('owner', 'firstName lastName email phone city'),
    BorrowRequest.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getReceivedBorrowRequests = async (ownerId, query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { owner: ownerId };

  if (query.status) {
    filter.status = query.status;
  }

  const [requests, total] = await Promise.all([
    BorrowRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images location availabilityStatus condition')
      .populate('borrower', 'firstName lastName email phone city address'),
    BorrowRequest.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getBorrowRequestById = async (requestId, userId, userRole) => {
  const request = await BorrowRequest.findById(requestId)
    .populate('equipment')
    .populate('borrower', 'firstName lastName email phone city address')
    .populate('owner', 'firstName lastName email phone city address');

  if (!request) {
    throw new AppError('Borrow request not found.', 404);
  }

  const isBorrower = request.borrower._id.toString() === userId.toString();
  const isOwner = request.owner._id.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isBorrower && !isOwner && !isAdmin) {
    throw new AppError('You are not authorized to view this borrow request.', 403);
  }

  return request;
};

export const approveBorrowRequest = async (requestId, userId, userRole) => {
  const request = await BorrowRequest.findById(requestId).populate('equipment');
  if (!request) {
    throw new AppError('Borrow request not found.', 404);
  }

  const isOwner = request.owner.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('Only the equipment owner or an admin can approve this request.', 403);
  }

  if (request.status !== 'PENDING') {
    throw new AppError(`Cannot approve a request with status "${request.status}".`, 400);
  }

  request.status = 'APPROVED';
  request.approvedAt = new Date();
  await request.save();

  // Set equipment to RESERVED
  await Equipment.findByIdAndUpdate(request.equipment._id, {
    availabilityStatus: 'RESERVED',
  });

  // Notify borrower
  await createNotification({
    user: request.borrower,
    title: 'Borrow Request Approved',
    message: `Your request to borrow "${request.equipment.name}" has been approved. You can now coordinate pickup.`,
    type: 'BORROW_APPROVED',
    relatedEquipment: request.equipment._id,
    relatedBorrowRequest: request._id,
  });

  return request;
};

export const rejectBorrowRequest = async (requestId, userId, userRole, rejectionReason) => {
  const request = await BorrowRequest.findById(requestId).populate('equipment');
  if (!request) {
    throw new AppError('Borrow request not found.', 404);
  }

  const isOwner = request.owner.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('Only the equipment owner or an admin can reject this request.', 403);
  }

  if (request.status !== 'PENDING') {
    throw new AppError(`Cannot reject a request with status "${request.status}".`, 400);
  }

  request.status = 'REJECTED';
  request.rejectedAt = new Date();
  request.rejectionReason = rejectionReason;
  await request.save();

  // Notify borrower
  await createNotification({
    user: request.borrower,
    title: 'Borrow Request Rejected',
    message: `Your request to borrow "${request.equipment.name}" was declined. Reason: ${rejectionReason}`,
    type: 'BORROW_REJECTED',
    relatedEquipment: request.equipment._id,
    relatedBorrowRequest: request._id,
  });

  return request;
};

export const cancelBorrowRequest = async (requestId, userId) => {
  const request = await BorrowRequest.findById(requestId).populate('equipment');
  if (!request) {
    throw new AppError('Borrow request not found.', 404);
  }

  if (request.borrower.toString() !== userId.toString()) {
    throw new AppError('Only the borrower can cancel this request.', 403);
  }

  if (!['PENDING', 'APPROVED'].includes(request.status)) {
    throw new AppError(`Cannot cancel a borrow request that is already ${request.status}.`, 400);
  }

  const wasApproved = request.status === 'APPROVED';
  request.status = 'CANCELLED';
  await request.save();

  // If it was reserved, free the equipment back to AVAILABLE
  if (wasApproved) {
    await Equipment.findByIdAndUpdate(request.equipment._id, {
      availabilityStatus: 'AVAILABLE',
    });
  }

  // Notify owner
  await createNotification({
    user: request.owner,
    title: 'Borrow Request Cancelled',
    message: `The borrower has cancelled their request for "${request.equipment.name}".`,
    type: 'GENERAL',
    relatedEquipment: request.equipment._id,
    relatedBorrowRequest: request._id,
  });

  return request;
};

export const pickupBorrowRequest = async (requestId, userId, userRole) => {
  const request = await BorrowRequest.findById(requestId).populate('equipment');
  if (!request) {
    throw new AppError('Borrow request not found.', 404);
  }

  const isOwner = request.owner.toString() === userId.toString();
  const isBorrower = request.borrower.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isBorrower && !isAdmin) {
    throw new AppError('Unauthorized to mark this equipment as picked up.', 403);
  }

  if (request.status !== 'APPROVED') {
    throw new AppError(`Cannot mark pickup for request with status "${request.status}". It must be APPROVED.`, 400);
  }

  request.status = 'ACTIVE';
  request.pickedUpAt = new Date();
  await request.save();

  await Equipment.findByIdAndUpdate(request.equipment._id, {
    availabilityStatus: 'BORROWED',
  });

  await createNotification({
    user: request.borrower,
    title: 'Equipment Picked Up - Active Borrowing',
    message: `You have picked up "${request.equipment.name}". Safe usage and swift recovery!`,
    type: 'GENERAL',
    relatedEquipment: request.equipment._id,
    relatedBorrowRequest: request._id,
  });

  return request;
};
