// Database types for SmartServe

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'cash' | 'split';
export type UserRole = 'customer' | 'staff' | 'admin';

export interface Canteen {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  canteen_id?: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  available_from?: string;
  available_to?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  preparation_time: number;
  ingredients?: string[];
  nutritional_info?: Record<string, any>;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  spice_level?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DiningTable {
  id: string;
  canteen_id?: string;
  table_number: string;
  qr_code?: string;
  capacity: number;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  table_id?: string;
  table_number: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method?: PaymentMethod;
  special_instructions?: string;
  estimated_preparation_time?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  item_status: OrderStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  split_info?: Record<string, any>;
  refund_amount: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  food_rating?: number;
  service_rating?: number;
  review_text?: string;
  admin_response?: string;
  is_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id?: string;
  session_id: string;
  message: string;
  response: string;
  context?: Record<string, any>;
  sentiment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'payment' | 'system' | 'kitchen';
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

// Extended types with relations
export interface MenuItemWithCategory extends MenuItem {
  category?: MenuCategory;
}

export interface OrderWithItems extends Order {
  order_items?: (OrderItem & { menu_item?: MenuItem })[];
  payment?: Payment[];
}

export interface OrderItemWithMenuItem extends OrderItem {
  menu_item?: MenuItem;
}

export interface FeedbackWithUser extends Feedback {
  user?: {
    email?: string;
    full_name?: string;
  };
}
