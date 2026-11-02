import Equipment from '../models/Equipment.js';
import BorrowRequest from '../models/BorrowRequest.js';
import Return from '../models/Return.js';
import Inspection from '../models/Inspection.js';
import Sanitization from '../models/Sanitization.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';
import { createNotification } from './notification.service.js';

export const getPendingEquipment = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { verificationStatus: 'PENDING' };

  if (query.category) {
    filter.category = query.category;
  }

  const [equipmentList, total] = await Promise.all([
    Equipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'firstName lastName email phone city state address pincode'),
    Equipment.countDocuments(filter),
  ]);

  return {
    equipment: equipmentList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const approveEquipment = async (equipmentId) => {
  const equipment = await Equipment.findById(equipmentId).populate('owner');
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  equipment.verificationStatus = 'APPROVED';
  equipment.availabilityStatus = 'AVAILABLE';
  equipment.rejectionReason = undefined;
  await equipment.save();

  // Notify owner
  await createNotification({
    user: equipment.owner._id,
    title: 'Equipment Approved',
    message: `Your equipment "${equipment.name}" has been approved by admin and is now publicly visible and AVAILABLE for community borrowing!`,
    type: 'EQUIPMENT_VERIFIED',
    relatedEquipment: equipment._id,
  });

  return equipment;
};

export const rejectEquipment = async (equipmentId, rejectionReason) => {
  const equipment = await Equipment.findById(equipmentId).populate('owner');
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  equipment.verificationStatus = 'REJECTED';
  equipment.availabilityStatus = 'UNAVAILABLE';
  equipment.rejectionReason = rejectionReason;
  await equipment.save();

  // Notify owner
  await createNotification({
    user: equipment.owner._id,
    title: 'Equipment Verification Declined',
    message: `Your equipment "${equipment.name}" was declined during verification. Reason: ${rejectionReason}`,
    type: 'EQUIPMENT_REJECTED',
    relatedEquipment: equipment._id,
  });

  return equipment;
};

export const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalEquipment,
    pendingEquipment,
    approvedEquipment,
    rejectedEquipment,
    availableEquipment,
    reservedEquipment,
    borrowedEquipment,
    maintenanceEquipment,
    sanitizationEquipment,
    totalBorrowRequests,
    pendingBorrowRequests,
    activeBorrowRequests,
    completedBorrowRequests,
    pendingReturns,
    pendingInspections,
    damageCases,
    pendingSanitizations,
    recentRequests,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    Equipment.countDocuments(),
    Equipment.countDocuments({ verificationStatus: 'PENDING' }),
    Equipment.countDocuments({ verificationStatus: 'APPROVED' }),
    Equipment.countDocuments({ verificationStatus: 'REJECTED' }),
    Equipment.countDocuments({ availabilityStatus: 'AVAILABLE' }),
    Equipment.countDocuments({ availabilityStatus: 'RESERVED' }),
    Equipment.countDocuments({ availabilityStatus: 'BORROWED' }),
    Equipment.countDocuments({ availabilityStatus: 'MAINTENANCE' }),
    Equipment.countDocuments({ availabilityStatus: 'SANITIZATION' }),
    BorrowRequest.countDocuments(),
    BorrowRequest.countDocuments({ status: 'PENDING' }),
    BorrowRequest.countDocuments({ status: 'ACTIVE' }),
    BorrowRequest.countDocuments({ status: 'COMPLETED' }),
    Return.countDocuments({ status: 'REQUESTED' }),
    Return.countDocuments({ status: 'INSPECTION_PENDING' }),
    Inspection.countDocuments({ status: 'DAMAGE_FOUND' }),
    Sanitization.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }),
    BorrowRequest.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('equipment', 'name category images availabilityStatus')
      .populate('borrower', 'firstName lastName email phone')
      .populate('owner', 'firstName lastName email phone'),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
    },
    equipment: {
      total: totalEquipment,
      pendingVerification: pendingEquipment,
      approved: approvedEquipment,
      rejected: rejectedEquipment,
      available: availableEquipment,
      reserved: reservedEquipment,
      borrowed: borrowedEquipment,
      inMaintenance: maintenanceEquipment,
      inSanitization: sanitizationEquipment,
    },
    borrowRequests: {
      total: totalBorrowRequests,
      pending: pendingBorrowRequests,
      active: activeBorrowRequests,
      completed: completedBorrowRequests,
    },
    operations: {
      pendingReturns,
      pendingInspections,
      damageCases,
      pendingSanitizations,
    },
    recentActivity: {
      recentRequests,
    },
  };
};

export const getAllUsers = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status === 'active' || query.isActive === 'true' || query.isActive === true) {
    filter.isActive = true;
  } else if (query.status === 'inactive' || query.isActive === 'false' || query.isActive === false) {
    filter.isActive = false;
  }

  if (query.search) {
    const searchRegex = { $regex: query.search.trim(), $options: 'i' };
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { city: searchRegex },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  // Aggregate listed equipment count and borrow count per user
  const userIds = users.map((u) => u._id);
  const [equipmentCounts, borrowCounts] = await Promise.all([
    Equipment.aggregate([
      { $match: { owner: { $in: userIds } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]),
    BorrowRequest.aggregate([
      { $match: { borrower: { $in: userIds } } },
      { $group: { _id: '$borrower', count: { $sum: 1 } } },
    ]),
  ]);

  const equipmentMap = {};
  equipmentCounts.forEach((item) => {
    equipmentMap[item._id.toString()] = item.count;
  });

  const borrowMap = {};
  borrowCounts.forEach((item) => {
    borrowMap[item._id.toString()] = item.count;
  });

  const safeUsers = users.map((u) => {
    const safeObj = u.toSafeObject();
    safeObj.equipmentCount = equipmentMap[u._id.toString()] || 0;
    safeObj.borrowCount = borrowMap[u._id.toString()] || 0;
    return safeObj;
  });

  return {
    users: safeUsers,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const toggleUserStatus = async (targetUserId, adminId) => {
  if (targetUserId.toString() === adminId.toString()) {
    throw new AppError('Administrators cannot deactivate their own account.', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Prevent deactivating the last active administrator
  if (user.role === 'ADMIN' && user.isActive) {
    const activeAdminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
    if (activeAdminCount <= 1) {
      throw new AppError('Cannot deactivate the last active administrator account.', 400);
    }
  }

  user.isActive = !user.isActive;
  await user.save();

  return {
    message: `User account has been ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    user: user.toSafeObject(),
  };
};

export const getAllFeedback = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = String(query.status).trim().toLowerCase();
  }

  if (query.category) {
    filter.category = String(query.category).trim();
  }

  if (query.search) {
    const searchRegex = { $regex: String(query.search).trim(), $options: 'i' };
    filter.$or = [
      { message: searchRegex },
      { category: searchRegex },
      { status: searchRegex },
    ];
  }

  const [feedbackList, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email role'),
    Feedback.countDocuments(filter),
  ]);

  return {
    feedback: feedbackList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const updateFeedbackStatus = async (feedbackId, status) => {
  const feedback = await Feedback.findById(feedbackId).populate('user', 'firstName lastName email');
  if (!feedback) {
    throw new AppError('Feedback not found.', 404);
  }

  feedback.status = status;
  await feedback.save();

  return feedback;
};

/**
 * System-wide borrow requests query for administrators
 */
export const getAllBorrowRequests = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = { $regex: query.search.trim(), $options: 'i' };
    const matchingUsers = await User.find({
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }],
    }).select('_id');

    const matchingEquipment = await Equipment.find({
      name: searchRegex,
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);
    const equipmentIds = matchingEquipment.map((e) => e._id);

    filter.$or = [
      { borrower: { $in: userIds } },
      { owner: { $in: userIds } },
      { equipment: { $in: equipmentIds } },
      { reason: searchRegex },
    ];
  }

  const [requests, total] = await Promise.all([
    BorrowRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images location availabilityStatus condition')
      .populate('borrower', 'firstName lastName email phone city address')
      .populate('owner', 'firstName lastName email phone city address'),
    BorrowRequest.countDocuments(filter),
  ]);

  return {
    requests,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * System-wide returns query for administrators
 */
export const getAllReturns = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.returnCondition) {
    filter.returnCondition = query.returnCondition;
  }

  if (query.search) {
    const searchRegex = { $regex: query.search.trim(), $options: 'i' };
    const matchingUsers = await User.find({
      $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }],
    }).select('_id');

    const matchingEquipment = await Equipment.find({
      name: searchRegex,
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);
    const equipmentIds = matchingEquipment.map((e) => e._id);

    filter.$or = [
      { borrower: { $in: userIds } },
      { owner: { $in: userIds } },
      { equipment: { $in: equipmentIds } },
      { notes: searchRegex },
    ];
  }

  const [returns, total] = await Promise.all([
    Return.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('equipment', 'name category images location availabilityStatus condition')
      .populate('borrower', 'firstName lastName email phone city')
      .populate('owner', 'firstName lastName email phone city')
      .populate('borrowRequest', 'status requestedFrom requestedUntil pickedUpAt returnedAt reason'),
    Return.countDocuments(filter),
  ]);

  return {
    returns,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

/**
 * System-wide equipment query for administrators
 */
export const getAllEquipment = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }

  if (query.availabilityStatus) {
    filter.availabilityStatus = query.availabilityStatus;
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.condition) {
    filter.condition = query.condition;
  }

  if (query.city) {
    filter['location.city'] = { $regex: query.city.trim(), $options: 'i' };
  }

  if (query.search) {
    const searchRegex = { $regex: query.search.trim(), $options: 'i' };
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { model: searchRegex },
      { 'location.city': searchRegex },
    ];
  }

  const [equipmentList, total] = await Promise.all([
    Equipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'firstName lastName email phone city state address pincode'),
    Equipment.countDocuments(filter),
  ]);

  return {
    equipment: equipmentList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};
