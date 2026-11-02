import { z } from 'zod';

export const feedbackCategories = [
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

export const submitFeedbackSchema = z.object({
  rating: z.coerce
    .number({ invalid_type_error: 'Please select a rating' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  message: z
    .string({ required_error: 'Feedback message is required' })
    .trim()
    .min(10, 'Feedback must contain at least 10 characters')
    .max(1000, 'Feedback cannot exceed 1000 characters'),
  category: z.enum(feedbackCategories).optional().default('General Feedback'),
});

export const feedbackStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved'], {
    invalid_type_error: 'Status must be one of pending, reviewed, or resolved',
  }),
});
