import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination.js';

export const createNotification = async ({
  user,
  title,
  message,
  type = 'GENERAL',
  relatedEquipment = null,
  relatedBorrowRequest = null,
}) => {
  try {
    return await Notification.create({
      user,
      title,
      message,
      type,
      relatedEquipment,
      relatedBorrowRequest,
    });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

export const getUserNotifications = async (userId, query = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const filter = { user: userId };

  if (query.unreadOnly === 'true' || query.unreadOnly === true) {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('relatedEquipment', 'name category images')
      .populate('relatedBorrowRequest', 'status requestedFrom requestedUntil'),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return {
    notifications,
    unreadCount,
    pagination: buildPaginationMeta(total, page, limit),
  };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
  return { message: 'All notifications marked as read' };
};
