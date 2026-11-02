import Equipment from '../models/Equipment.js';
import BorrowRequest from '../models/BorrowRequest.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';

export const createEquipment = async (ownerId, data, imagePaths = []) => {
  const equipment = await Equipment.create({
    ...data,
    owner: ownerId,
    images: imagePaths,
    verificationStatus: 'PENDING',
    availabilityStatus: 'UNAVAILABLE',
  });

  return equipment;
};

export const getAllEquipment = async (query = {}, currentUser = null) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const filter = {};

  // Visibility logic: standard users only see APPROVED equipment
  const isAdmin = currentUser && currentUser.role === 'ADMIN';
  if (!isAdmin) {
    filter.verificationStatus = 'APPROVED';
  } else if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }

  // Availability filter (e.g., AVAILABLE)
  if (query.availabilityStatus) {
    filter.availabilityStatus = query.availabilityStatus;
  } else if (!isAdmin && !query.includeAllStatuses) {
    // By default for discovery, show available equipment
    filter.availabilityStatus = 'AVAILABLE';
  }

  // Category filter
  if (query.category) {
    filter.category = query.category;
  }

  // Condition filter
  if (query.condition) {
    filter.condition = query.condition;
  }

  // City / Location filter
  if (query.city) {
    filter['location.city'] = { $regex: query.city, $options: 'i' };
  }

  // Search keyword (matches name, description, brand, model)
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

  // Sorting
  const sortOptions = {};
  if (query.sortBy) {
    const order = query.order === 'asc' ? 1 : -1;
    sortOptions[query.sortBy] = order;
  } else {
    sortOptions.createdAt = -1;
  }

  const [equipmentList, total] = await Promise.all([
    Equipment.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'firstName lastName city email phone'),
    Equipment.countDocuments(filter),
  ]);

  return {
    equipment: equipmentList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getEquipmentById = async (equipmentId, currentUser = null) => {
  const equipment = await Equipment.findById(equipmentId).populate(
    'owner',
    'firstName lastName city email phone profileImage address pincode'
  );

  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  // Non-approved equipment can only be viewed by owner or admin
  const isOwner = currentUser && equipment.owner && equipment.owner._id.toString() === currentUser._id.toString();
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  if (equipment.verificationStatus !== 'APPROVED' && !isOwner && !isAdmin) {
    throw new AppError('This equipment is pending verification or unavailable.', 403);
  }

  return equipment;
};

export const updateEquipment = async (equipmentId, userId, userRole, updateData, newImagePaths = []) => {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  const isOwner = equipment.owner.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to update this equipment.', 403);
  }

  // If new images were uploaded, append them
  if (newImagePaths && newImagePaths.length > 0) {
    updateData.images = [...(equipment.images || []), ...newImagePaths];
  }

  // Non-admin cannot change verificationStatus directly
  if (!isAdmin) {
    delete updateData.verificationStatus;
    delete updateData.rejectionReason;
  }

  Object.assign(equipment, updateData);
  await equipment.save();

  return equipment;
};

export const deleteEquipment = async (equipmentId, userId, userRole) => {
  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    throw new AppError('Equipment not found.', 404);
  }

  const isOwner = equipment.owner.toString() === userId.toString();
  const isAdmin = userRole === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to delete this equipment.', 403);
  }

  // Prevent deletion if equipment is actively borrowed or reserved
  const activeRequests = await BorrowRequest.findOne({
    equipment: equipmentId,
    status: { $in: ['APPROVED', 'ACTIVE', 'RETURN_REQUESTED'] },
  });

  if (activeRequests) {
    throw new AppError(
      'Cannot delete equipment that is currently reserved, borrowed, or in the return process.',
      400
    );
  }

  await Equipment.findByIdAndDelete(equipmentId);

  return { message: 'Equipment deleted successfully.' };
};

export const getMyEquipment = async (userId, query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { owner: userId };

  if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }
  if (query.availabilityStatus) {
    filter.availabilityStatus = query.availabilityStatus;
  }

  const [equipmentList, total] = await Promise.all([
    Equipment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Equipment.countDocuments(filter),
  ]);

  return {
    equipment: equipmentList,
    pagination: buildPaginationMeta(total, page, limit),
  };
};
