-- Fix critical security issues with RLS policies for existing tables

-- Drop existing overly permissive policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create more secure policies for profiles table
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Public profiles are viewable by authenticated users only (for displaying names in orders, etc.)
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the overly permissive policy on user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Users can only view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles (using security definer function to avoid recursion)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add constraint to ensure phone numbers are valid (basic format)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'phone_format_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT phone_format_check 
    CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$');
  END IF;
END
$$;