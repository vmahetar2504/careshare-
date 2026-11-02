import mongoose from 'mongoose';

const { Schema } = mongoose;

const inspectionSchema = new Schema(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    borrowRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: [true, 'Borrow request is required'],
    },
    returnRecord: {
      type: Schema.Types.ObjectId,
      ref: 'Return',
      required: [true, 'Return record is required'],
    },
    inspectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector is required'],
    },
    conditionBefore: {
      type: String,
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR'],
    },
    conditionAfter: {
      type: String,
      required: [true, 'Condition after inspection is required'],
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'],
    },
    damageFound: {
      type: Boolean,
      default: false,
    },
    damageDescription: {
      type: String,
    },
    estimatedRepairRequired: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PASSED', 'DAMAGE_FOUND'],
      default: 'PENDING',
    },
    inspectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);

export default Inspection;
