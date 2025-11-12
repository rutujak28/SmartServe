-- =============================================
-- SMARTSERVE DATABASE SCHEMA
-- Phase 6: Complete Database Implementation
-- Using correct app_role enum: customer, staff, admin
-- =============================================

-- =============================================
-- 1. ENUMS
-- =============================================

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'served',
  'cancelled'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
  'upi',
  'card',
  'cash',
  'split'
);

-- =============================================
-- 2. TABLES
-- =============================================

-- Canteens table (multi-tenant support)
CREATE TABLE canteens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  opening_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Menu categories table
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  available_from TIME,
  available_to TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  preparation_time INTEGER DEFAULT 15 CHECK (preparation_time > 0),
  ingredients TEXT[],
  nutritional_info JSONB,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  spice_level INTEGER CHECK (spice_level BETWEEN 0 AND 5),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tables (physical dining tables)
CREATE TABLE dining_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canteen_id UUID REFERENCES canteens(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  capacity INTEGER DEFAULT 4,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(canteen_id, table_number)
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
  table_number TEXT NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method payment_method,
  special_instructions TEXT,
  estimated_preparation_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  special_instructions TEXT,
  item_status order_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  split_info JSONB,
  refund_amount DECIMAL(10, 2) DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback/Reviews table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  review_text TEXT,
  admin_response TEXT,
  is_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Wishlist table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

-- AI Conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_feedback_order ON feedback(order_id);
CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id);

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Canteens policies (public read, admin write)
CREATE POLICY "Canteens are viewable by everyone" ON canteens
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage canteens" ON canteens
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Menu categories policies
CREATE POLICY "Menu categories are viewable by everyone" ON menu_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage menu categories" ON menu_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Menu items policies
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Dining tables policies
CREATE POLICY "Tables are viewable by authenticated users" ON dining_tables
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage tables" ON dining_tables
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff and admins can view all orders" ON orders
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff and admins can update orders" ON orders
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all order items" ON order_items
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update order items" ON order_items
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

-- Payments policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and staff can view all payments" ON payments
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

CREATE POLICY "Users can create payments for their orders" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can update payments" ON payments
  FOR UPDATE USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'staff')
  );

-- Feedback policies
CREATE POLICY "Users can view their own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON feedback
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create feedback for their orders" ON feedback
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = feedback.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update feedback (responses)" ON feedback
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON ai_conversations
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 5. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

CREATE TRIGGER update_canteens_updated_at
  BEFORE UPDATE ON canteens
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_dining_tables_updated_at
  BEFORE UPDATE ON dining_tables
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- 6. STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'canteen-logos',
  'canteen-logos',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Menu images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "Admins can upload menu images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update menu images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete menu images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Canteen logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'canteen-logos');

CREATE POLICY "Admins can upload canteen logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'canteen-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update canteen logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'canteen-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete canteen logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'canteen-logos' AND has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param UUID)
RETURNS TABLE (subtotal DECIMAL, tax_amount DECIMAL, total_amount DECIMAL)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_subtotal DECIMAL;
  v_tax_rate DECIMAL := 0.05;
BEGIN
  SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
  FROM order_items WHERE order_id = order_id_param;
  
  RETURN QUERY SELECT v_subtotal, ROUND(v_subtotal * v_tax_rate, 2), ROUND(v_subtotal * (1 + v_tax_rate), 2);
END;
$$;

CREATE OR REPLACE FUNCTION get_order_statistics(
  start_date TIMESTAMPTZ DEFAULT NULL,
  end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  average_order_value DECIMAL,
  pending_orders BIGINT,
  completed_orders BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COALESCE(SUM(total_amount), 0),
    COALESCE(AVG(total_amount), 0),
    COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed', 'preparing'))::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('served'))::BIGINT
  FROM orders
  WHERE 
    (start_date IS NULL OR created_at >= start_date) AND
    (end_date IS NULL OR created_at <= end_date);
END;
$$;

-- =============================================
-- 8. SEED DATA
-- =============================================

INSERT INTO canteens (id, name, description, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'SmartServe Canteen',
  'Your smart dining experience',
  true
) ON CONFLICT (id) DO NOTHING;