import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { buildPaginationMeta, getPaginationOptions } from '../utils/pagination.js';

export const createFeedback = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const feedback = await Feedback.create({
    user: userId,
    rating: payload.rating,
    message: payload.message,
    category: payload.category || 'General Feedback',
    status: 'pending',
  });

  return feedback.populate('user', 'firstName lastName email');
};

export const getUserFeedback = async (userId, query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { user: userId };

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter),
  ]);

  return {
    feedback,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const getAllFeedback = async (query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = {};

  if (query.status) {
    filter.status = String(query.status).toLowerCase();
  }

  if (query.category) {
    filter.category = String(query.category);
  }

  if (query.search) {
    const searchRegex = { $regex: String(query.search).trim(), $options: 'i' };
    filter.$or = [
      { message: searchRegex },
      { category: searchRegex },
      { status: searchRegex },
    ];
  }

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email'),
    Feedback.countDocuments(filter),
  ]);

  return {
    feedback,
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
