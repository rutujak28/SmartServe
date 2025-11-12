-- Fix RLS policy exposure on profiles table
-- Drop the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON profiles;

-- The restrictive policy "Users can view own profile" remains, ensuring users can only see their own data
-- If admin access is needed in the future, create a separate policy using has_role()