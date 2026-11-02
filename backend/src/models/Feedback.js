import mongoose from 'mongoose';

const { Schema } = mongoose;

const feedbackCategories = [
  'General Feedback',
  'Website Experience',
  'Equipment Listing',
  'Borrowing Experience',
  'Donation Experience',
  'User Experience',
  'Bug Report',
  'Suggestion',
  'Other',
];

const feedbackSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
      minlength: [10, 'Feedback must contain at least 10 characters'],
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: feedbackCategories,
        message: 'Please choose a valid feedback category',
      },
      default: 'General Feedback',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'resolved'],
        message: 'Please choose a valid status',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
export { feedbackCategories };
