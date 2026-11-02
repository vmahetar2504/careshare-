import { z } from 'zod';

const allowedCategories = [
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
];

const allowedConditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR'];

export const createEquipmentSchema = z.object({
  name: z
    .string({ required_error: 'Equipment name is required' })
    .trim()
    .min(2, 'Equipment name must be at least 2 characters')
    .max(100, 'Equipment name cannot exceed 100 characters'),
  category: z.enum(allowedCategories, {
    errorMap: () => ({ message: `Category must be one of: ${allowedCategories.join(', ')}` }),
  }),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
  brand: z.string().trim().max(100).optional().or(z.literal('')),
  model: z.string().trim().max(100).optional().or(z.literal('')),
  condition: z.enum(allowedConditions, {
    errorMap: () => ({ message: `Condition must be one of: ${allowedConditions.join(', ')}` }),
  }),
  quantity: z
    .union([z.number(), z.string()])
    .optional()
    .default(1)
    .transform((val) => Number(val))
    .refine((val) => val >= 1, { message: 'Quantity must be at least 1' }),
  location: z
    .object({
      address: z.string().trim().optional().or(z.literal('')),
      city: z.string().trim().optional().or(z.literal('')),
      state: z.string().trim().optional().or(z.literal('')),
      pincode: z.string().trim().optional().or(z.literal('')),
    })
    .optional(),
  usageInstructions: z.string().trim().max(3000).optional().or(z.literal('')),
  safetyInformation: z.string().trim().max(3000).optional().or(z.literal('')),
});

export const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  availabilityStatus: z
    .enum(['AVAILABLE', 'BORROWED', 'RESERVED', 'MAINTENANCE', 'SANITIZATION', 'UNAVAILABLE'])
    .optional(),
});
