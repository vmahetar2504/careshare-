import mongoose from 'mongoose';

const { Schema } = mongoose;

const borrowRequestSchema = new Schema(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    requestedFrom: {
      type: Date,
      required: [true, 'Requested from date is required'],
    },
    requestedUntil: {
      type: Date,
      required: [true, 'Requested until date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'ACTIVE',
        'RETURN_REQUESTED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    pickedUpAt: {
      type: Date,
    },
    returnedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
borrowRequestSchema.index({ borrower: 1 });
borrowRequestSchema.index({ owner: 1 });
borrowRequestSchema.index({ equipment: 1 });
borrowRequestSchema.index({ status: 1 });

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema);

export default BorrowRequest;
