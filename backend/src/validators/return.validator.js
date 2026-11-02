import { z } from 'zod';

const returnConditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'];

export const createReturnRequestSchema = z.object({
  borrowRequestId: z
    .string({ required_error: 'Borrow request ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Borrow Request ID format'),
  returnCondition: z
    .enum(returnConditions, {
      errorMap: () => ({
        message: `Return condition must be one of: ${returnConditions.join(', ')}`,
      }),
    })
    .optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const receiveReturnSchema = z.object({
  returnCondition: z.enum(returnConditions, {
    errorMap: () => ({
      message: `Return condition must be one of: ${returnConditions.join(', ')}`,
    }),
  }),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});
