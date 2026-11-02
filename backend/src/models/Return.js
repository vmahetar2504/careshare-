import mongoose from 'mongoose';

const { Schema } = mongoose;

const returnSchema = new Schema(
  {
    borrowRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: [true, 'Borrow request is required'],
    },
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
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    returnedAt: {
      type: Date,
    },
    returnCondition: {
      type: String,
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'],
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'RECEIVED', 'INSPECTION_PENDING', 'COMPLETED'],
      default: 'REQUESTED',
    },
  },
  {
    timestamps: true,
  }
);

const Return = mongoose.model('Return', returnSchema);

export default Return;
