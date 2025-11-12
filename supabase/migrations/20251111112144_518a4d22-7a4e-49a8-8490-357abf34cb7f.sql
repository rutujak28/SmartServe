-- Add admin role to rutujakantak28@gmail.com
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'rutujakantak28@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;