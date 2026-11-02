import { z } from 'zod';

export const createBorrowRequestSchema = z
  .object({
    equipmentId: z
      .string({ required_error: 'Equipment ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Equipment ID format'),
    requestedFrom: z
      .string({ required_error: 'Start date (requestedFrom) is required' })
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
    requestedUntil: z
      .string({ required_error: 'End date (requestedUntil) is required' })
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
    reason: z
      .string({ required_error: 'Reason is required' })
      .trim()
      .min(5, 'Reason must be at least 5 characters long')
      .max(1000, 'Reason cannot exceed 1000 characters'),
    message: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => new Date(data.requestedFrom) < new Date(data.requestedUntil),
    {
      message: 'requestedUntil date must be after requestedFrom date',
      path: ['requestedUntil'],
    }
  );

export const rejectBorrowRequestSchema = z.object({
  rejectionReason: z
    .string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters long')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});
