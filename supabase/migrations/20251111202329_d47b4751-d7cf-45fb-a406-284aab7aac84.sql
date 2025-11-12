-- Seed Data for SmartServe Testing

-- Insert a default canteen
INSERT INTO public.canteens (id, name, description, email, phone, address, logo_url, is_active, opening_hours)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'SmartServe Campus Canteen',
  'Your friendly campus dining destination',
  'canteen@smartserve.com',
  '+91 98765 43210',
  'Building A, Ground Floor, Campus Road',
  NULL,
  true,
  '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "9:00 AM - 6:00 PM", "sunday": "Closed"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert dining tables
INSERT INTO public.dining_tables (id, canteen_id, table_number, capacity, location, qr_code, is_active)
VALUES 
  ('10000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '1', 4, 'Ground Floor - Window Side', 'QR-TABLE-001', true),
  ('10000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '2', 4, 'Ground Floor - Center', 'QR-TABLE-002', true),
  ('10000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '3', 2, 'First Floor - Corner', 'QR-TABLE-003', true),
  ('10000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '4', 6, 'First Floor - Center', 'QR-TABLE-004', true),
  ('10000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, '5', 4, 'Ground Floor - Near Kitchen', 'QR-TABLE-005', true)
ON CONFLICT (id) DO NOTHING;

-- Insert menu categories
INSERT INTO public.menu_categories (id, canteen_id, name, description, display_order, available_from, available_to, is_active)
VALUES 
  ('20000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Breakfast', 'Start your day right', 1, '08:00:00', '11:00:00', true),
  ('20000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Lunch Specials', 'Hearty meals for midday', 2, '12:00:00', '15:00:00', true),
  ('20000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Snacks', 'Quick bites anytime', 3, '08:00:00', '20:00:00', true),
  ('20000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Beverages', 'Refresh yourself', 4, '08:00:00', '20:00:00', true),
  ('20000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'Chinese', 'Asian favorites', 5, '12:00:00', '20:00:00', true),
  ('20000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-0000-0000-000000000001'::uuid, 'South Indian', 'Authentic flavors', 6, '08:00:00', '20:00:00', true)
ON CONFLICT (id) DO NOTHING;

-- Insert menu items
INSERT INTO public.menu_items (id, category_id, name, description, price, image_url, ingredients, is_available, is_vegetarian, is_vegan, spice_level, preparation_time, nutritional_info, display_order)
VALUES 
  -- Breakfast
  ('30000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000001'::uuid, 'Masala Dosa', 'Crispy rice crepe with spiced potato filling', 80, NULL, ARRAY['Rice', 'Potato', 'Onion', 'Spices'], true, true, true, 2, 15, '{"calories": 250, "protein": "6g", "carbs": "45g", "fat": "8g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000002'::uuid, '20000000-0000-0000-0000-000000000001'::uuid, 'Idli Sambhar', '3 steamed rice cakes with sambhar and chutney', 60, NULL, ARRAY['Rice', 'Lentils', 'Vegetables'], true, true, true, 1, 10, '{"calories": 180, "protein": "5g", "carbs": "35g", "fat": "3g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000003'::uuid, '20000000-0000-0000-0000-000000000001'::uuid, 'Poha', 'Flattened rice with peanuts and spices', 50, NULL, ARRAY['Flattened Rice', 'Peanuts', 'Curry Leaves'], true, true, true, 1, 12, '{"calories": 200, "protein": "4g", "carbs": "38g", "fat": "5g"}'::jsonb, 3),
  
  -- Lunch
  ('30000000-0000-0000-0000-000000000004'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'Dal Tadka with Rice', 'Yellow lentils tempered with spices, served with steamed rice', 120, NULL, ARRAY['Lentils', 'Rice', 'Spices', 'Ghee'], true, true, false, 2, 20, '{"calories": 350, "protein": "12g", "carbs": "58g", "fat": "9g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000005'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'Paneer Butter Masala', 'Cottage cheese in rich tomato gravy with 2 rotis', 180, NULL, ARRAY['Paneer', 'Tomato', 'Cream', 'Wheat'], true, true, false, 2, 25, '{"calories": 450, "protein": "18g", "carbs": "42g", "fat": "22g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000006'::uuid, '20000000-0000-0000-0000-000000000002'::uuid, 'Rajma Chawal', 'Kidney bean curry with steamed rice', 110, NULL, ARRAY['Kidney Beans', 'Rice', 'Onion', 'Tomato'], true, true, false, 2, 20, '{"calories": 380, "protein": "14g", "carbs": "65g", "fat": "7g"}'::jsonb, 3),
  
  -- Snacks
  ('30000000-0000-0000-0000-000000000007'::uuid, '20000000-0000-0000-0000-000000000003'::uuid, 'Samosa', 'Crispy fried pastry with spiced potato filling (2 pcs)', 40, NULL, ARRAY['Potato', 'Peas', 'Wheat', 'Spices'], true, true, true, 2, 8, '{"calories": 220, "protein": "4g", "carbs": "28g", "fat": "10g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000008'::uuid, '20000000-0000-0000-0000-000000000003'::uuid, 'Vada Pav', 'Spiced potato fritter in a bun with chutney', 35, NULL, ARRAY['Potato', 'Bread', 'Gram Flour'], true, true, true, 3, 10, '{"calories": 280, "protein": "6g", "carbs": "42g", "fat": "11g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000009'::uuid, '20000000-0000-0000-0000-000000000003'::uuid, 'Pakora Plate', 'Mixed vegetable fritters (6 pcs)', 60, NULL, ARRAY['Vegetables', 'Gram Flour', 'Spices'], true, true, true, 2, 12, '{"calories": 300, "protein": "8g", "carbs": "35g", "fat": "15g"}'::jsonb, 3),
  
  -- Beverages
  ('30000000-0000-0000-0000-000000000010'::uuid, '20000000-0000-0000-0000-000000000004'::uuid, 'Masala Chai', 'Traditional Indian spiced tea', 20, NULL, ARRAY['Tea', 'Milk', 'Spices', 'Sugar'], true, true, false, 0, 5, '{"calories": 80, "protein": "2g", "carbs": "14g", "fat": "2g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000011'::uuid, '20000000-0000-0000-0000-000000000004'::uuid, 'Fresh Lime Soda', 'Refreshing lemonade with soda', 30, NULL, ARRAY['Lime', 'Sugar', 'Soda'], true, true, true, 0, 3, '{"calories": 60, "protein": "0g", "carbs": "15g", "fat": "0g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000012'::uuid, '20000000-0000-0000-0000-000000000004'::uuid, 'Filter Coffee', 'South Indian style filter coffee', 25, NULL, ARRAY['Coffee', 'Milk', 'Sugar'], true, true, false, 0, 5, '{"calories": 90, "protein": "3g", "carbs": "12g", "fat": "3g"}'::jsonb, 3),
  
  -- Chinese
  ('30000000-0000-0000-0000-000000000013'::uuid, '20000000-0000-0000-0000-000000000005'::uuid, 'Veg Fried Rice', 'Stir-fried rice with mixed vegetables', 120, NULL, ARRAY['Rice', 'Vegetables', 'Soy Sauce'], true, true, true, 1, 15, '{"calories": 320, "protein": "8g", "carbs": "58g", "fat": "8g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000014'::uuid, '20000000-0000-0000-0000-000000000005'::uuid, 'Hakka Noodles', 'Stir-fried noodles with vegetables', 110, NULL, ARRAY['Noodles', 'Vegetables', 'Sauces'], true, true, true, 2, 15, '{"calories": 340, "protein": "9g", "carbs": "52g", "fat": "10g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000015'::uuid, '20000000-0000-0000-0000-000000000005'::uuid, 'Manchurian Dry', 'Crispy vegetable balls in spicy sauce', 140, NULL, ARRAY['Vegetables', 'Corn Flour', 'Sauces'], true, true, true, 3, 18, '{"calories": 280, "protein": "7g", "carbs": "38g", "fat": "12g"}'::jsonb, 3),
  
  -- South Indian
  ('30000000-0000-0000-0000-000000000016'::uuid, '20000000-0000-0000-0000-000000000006'::uuid, 'Plain Dosa', 'Crispy rice crepe served with sambhar and chutney', 60, NULL, ARRAY['Rice', 'Lentils'], true, true, true, 1, 12, '{"calories": 180, "protein": "5g", "carbs": "35g", "fat": "3g"}'::jsonb, 1),
  ('30000000-0000-0000-0000-000000000017'::uuid, '20000000-0000-0000-0000-000000000006'::uuid, 'Uttapam', 'Thick rice pancake with onion and tomato topping', 70, NULL, ARRAY['Rice', 'Onion', 'Tomato'], true, true, true, 1, 15, '{"calories": 210, "protein": "6g", "carbs": "38g", "fat": "5g"}'::jsonb, 2),
  ('30000000-0000-0000-0000-000000000018'::uuid, '20000000-0000-0000-0000-000000000006'::uuid, 'Medu Vada', 'Crispy lentil donuts (3 pcs)', 50, NULL, ARRAY['Lentils', 'Spices'], true, true, true, 2, 12, '{"calories": 190, "protein": "7g", "carbs": "22g", "fat": "9g"}'::jsonb, 3)
ON CONFLICT (id) DO NOTHING;