import { z } from 'zod';

export const menuCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  available_from: z.string().optional(),
  available_to: z.string().optional(),
});

export const menuItemSchema = z.object({
  category_id: z.string().uuid('Invalid category'),
  name: z.string().trim().min(1, 'Item name is required').max(200),
  description: z.string().trim().max(1000).optional(),
  price: z.number().min(0, 'Price must be positive').max(9999.99),
  preparation_time: z.number().int().min(1, 'Preparation time must be at least 1 minute').max(120),
  ingredients: z.array(z.string()).optional(),
  nutritional_info: z.record(z.any()).optional(),
  is_available: z.boolean().default(true),
  is_vegetarian: z.boolean().default(false),
  is_vegan: z.boolean().default(false),
  spice_level: z.number().int().min(0).max(5).optional(),
  display_order: z.number().int().min(0).default(0),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

export type MenuCategoryFormData = z.infer<typeof menuCategorySchema>;
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
