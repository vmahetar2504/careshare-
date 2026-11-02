import { z } from 'zod';

export const createSanitizationSchema = z.object({
  inspectionId: z
    .string({ required_error: 'Inspection ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Inspection ID format'),
  method: z
    .string({ required_error: 'Sanitization method is required' })
    .trim()
    .min(3, 'Sanitization method must be at least 3 characters long')
    .max(200, 'Sanitization method cannot exceed 200 characters'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const completeSanitizationSchema = z.object({
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});
