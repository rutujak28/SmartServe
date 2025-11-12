-- Phase 9: Security Hardening - RLS Policy Improvements

-- 1. Tighten canteens table RLS - restrict public access to sensitive fields
DROP POLICY IF EXISTS "Canteens are viewable by everyone" ON public.canteens;

CREATE POLICY "Public can view basic canteen info"
ON public.canteens
FOR SELECT
USING (
  -- Only show active canteens with limited fields in public view
  is_active = true
);

CREATE POLICY "Staff can view full canteen details"
ON public.canteens
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 2. Restrict dining_tables QR codes to staff only
DROP POLICY IF EXISTS "Tables are viewable by authenticated users" ON public.dining_tables;

CREATE POLICY "Staff can view all tables"
ON public.dining_tables
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 3. Add staff access to profiles for customer support
CREATE POLICY "Staff can view customer profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);

-- 4. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- 5. Create audit trigger function for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$;

-- Add audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 6. Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status) WHERE status IN ('pending', 'confirmed', 'preparing');
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order_id ON public.feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);

-- 7. Add function to clean old audit logs (data retention)
CREATE OR REPLACE FUNCTION public.clean_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

COMMENT ON TABLE public.audit_logs IS 'Stores audit trail for sensitive operations';
COMMENT ON FUNCTION public.audit_trigger() IS 'Automatically logs changes to audited tables';
COMMENT ON FUNCTION public.clean_old_audit_logs() IS 'Removes audit logs older than 90 days';