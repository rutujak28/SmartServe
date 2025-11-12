-- Enable real-time for feedback table
ALTER TABLE public.feedback REPLICA IDENTITY FULL;

-- Enable real-time for orders table (if not already enabled)
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Enable real-time for order_items table
ALTER TABLE public.order_items REPLICA IDENTITY FULL;

-- Enable real-time for menu_items table (for live menu updates)
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;

-- Enable real-time for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add feedback table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'feedback'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
  END IF;
END $$;

-- Add orders table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- Add order_items table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
  END IF;
END $$;

-- Add menu_items table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;

-- Add profiles table to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;