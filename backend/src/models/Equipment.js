import mongoose from 'mongoose';

const { Schema } = mongoose;

const equipmentSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Wheelchair',
        'Walker',
        'Crutches',
        'Hospital Bed',
        'Oxygen Equipment',
        'Commode Chair',
        'Patient Lift',
        'Nebulizer',
        'Blood Pressure Monitor',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['NEW', 'EXCELLENT', 'GOOD', 'FAIR'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'Quantity must be at least 1'],
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    availabilityStatus: {
      type: String,
      enum: [
        'AVAILABLE',
        'BORROWED',
        'RESERVED',
        'MAINTENANCE',
        'SANITIZATION',
        'UNAVAILABLE',
      ],
      default: 'UNAVAILABLE',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    rejectionReason: {
      type: String,
    },
    usageInstructions: {
      type: String,
    },
    safetyInformation: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ availabilityStatus: 1 });
equipmentSchema.index({ verificationStatus: 1 });
equipmentSchema.index({ owner: 1 });
equipmentSchema.index({ 'location.city': 1 });

const Equipment = mongoose.model('Equipment', equipmentSchema);

export default Equipment;
