import { z } from 'zod';

/**
 * Validation schemas for user inputs
 */

// Table number validation
export const tableNumberSchema = z
  .string()
  .trim()
  .min(1, 'Table number is required')
  .max(10, 'Table number must be less than 10 characters')
  .regex(/^[A-Z0-9-]+$/i, 'Invalid table number format');

// Phone number validation  
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
  .optional();

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Full name validation
export const fullNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Review text validation
export const reviewTextSchema = z
  .string()
  .trim()
  .max(1000, 'Review must be less than 1000 characters')
  .optional();

// Rating validation
export const ratingSchema = z
  .number()
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

/**
 * Form validation schemas
 */

export const signupSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const profileUpdateSchema = z.object({
  fullName: fullNameSchema.optional(),
  phone: phoneSchema,
  avatarUrl: z.string().url('Invalid URL').optional()
});

export const feedbackSchema = z.object({
  rating: ratingSchema,
  reviewText: reviewTextSchema
});

/**
 * Sanitization utilities
 */

/**
 * Sanitize string input by trimming and removing potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
};

/**
 * Sanitize number input
 */
export const sanitizeNumber = (input: number, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
  const num = Number(input);
  if (isNaN(num)) return min;
  return Math.max(min, Math.min(max, num));
};

/**
 * Encode string for URL parameters
 */
export const encodeForUrl = (input: string): string => {
  return encodeURIComponent(sanitizeString(input));
};

/**
 * Validate and sanitize table number
 */
export const validateTableNumber = (tableNumber: string): { valid: boolean; error?: string; value?: string } => {
  try {
    const value = tableNumberSchema.parse(tableNumber);
    return { valid: true, value };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid table number' };
  }
};

/**
 * Validate order quantity
 */
export const validateQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;
};
