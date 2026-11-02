import { z } from 'zod';

const validConditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR'];
const validAfterConditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED'];

export const createInspectionSchema = z
  .object({
    returnId: z
      .string({ required_error: 'Return record ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Return ID format'),
    conditionBefore: z
      .enum(validConditions, {
        errorMap: () => ({
          message: `Condition before must be one of: ${validConditions.join(', ')}`,
        }),
      })
      .optional(),
    conditionAfter: z.enum(validAfterConditions, {
      errorMap: () => ({
        message: `Condition after must be one of: ${validAfterConditions.join(', ')}`,
      }),
    }),
    damageFound: z.boolean().default(false),
    damageDescription: z.string().trim().max(1000).optional().or(z.literal('')),
    estimatedRepairRequired: z.boolean().default(false),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.damageFound && (!data.damageDescription || data.damageDescription.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Damage description is required when damage is found',
      path: ['damageDescription'],
    }
  );

export const updateInspectionSchema = z.object({
  conditionAfter: z
    .enum(validAfterConditions, {
      errorMap: () => ({
        message: `Condition after must be one of: ${validAfterConditions.join(', ')}`,
      }),
    })
    .optional(),
  damageFound: z.boolean().optional(),
  damageDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  estimatedRepairRequired: z.boolean().optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});
