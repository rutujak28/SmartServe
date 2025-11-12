import { z } from 'zod';

export const orderItemSchema = z.object({
  menu_item_id: z.string().uuid('Invalid menu item'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100),
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
  special_instructions: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  table_number: z.string().trim().min(1, 'Table number is required').max(10),
  subtotal: z.number().min(0),
  tax_amount: z.number().min(0),
  total_amount: z.number().min(0),
  payment_method: z.enum(['upi', 'card', 'cash', 'split']).optional(),
  special_instructions: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled']),
});

export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
