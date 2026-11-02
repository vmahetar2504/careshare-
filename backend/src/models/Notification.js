import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: [
        'BORROW_REQUEST',
        'BORROW_APPROVED',
        'BORROW_REJECTED',
        'RETURN_REQUESTED',
        'EQUIPMENT_VERIFIED',
        'EQUIPMENT_REJECTED',
        'INSPECTION',
        'SANITIZATION',
        'GENERAL',
      ],
      default: 'GENERAL',
    },
    relatedEquipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
    },
    relatedBorrowRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
