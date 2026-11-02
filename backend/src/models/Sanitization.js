import mongoose from 'mongoose';

const { Schema } = mongoose;

const sanitizationSchema = new Schema(
  {
    equipment: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    inspection: {
      type: Schema.Types.ObjectId,
      ref: 'Inspection',
      required: [true, 'Inspection is required'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performer is required'],
    },
    method: {
      type: String,
      required: [true, 'Sanitization method is required'],
      trim: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },
    sanitizedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Sanitization = mongoose.model('Sanitization', sanitizationSchema);

export default Sanitization;
