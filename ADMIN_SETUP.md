# SmartServe Admin Setup Guide

## Creating Your First Admin User

Follow these steps to set up your admin account:

### Step 1: Sign Up as a Regular User

1. Go to `/signup` in your app
2. Create an account with your email and password
3. Verify your email if required
4. You'll be signed in as a regular customer user

### Step 2: Get Your User ID

**Option A: From Supabase Dashboard**
1. Go to [Supabase Dashboard - Users](https://supabase.com/dashboard/project/dbwepxwwnauhvptxqqic/auth/users)
2. Find your user in the list
3. Copy your User ID (UUID)

**Option B: From Browser Console**
1. While logged into your app, open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('sb-dbwepxwwnauhvptxqqic-auth-token')`
4. Copy the user ID from the token

### Step 3: Assign Admin Role

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/dbwepxwwnauhvptxqqic/sql/new)
2. Run this SQL command (replace `YOUR_USER_ID` with your actual user ID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID'::uuid, 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 4: Access Admin Dashboard

1. Go to `/admin/login`
2. Sign in with your email and password
3. You'll be redirected to the admin dashboard!

## What's Included

Your database now has sample data:
- **1 Canteen**: SmartServe Campus Canteen
- **5 Tables**: Tables 1-5 with QR codes
- **6 Categories**: Breakfast, Lunch, Snacks, Beverages, Chinese, South Indian
- **18 Menu Items**: Sample dishes with prices, ingredients, and nutritional info

## Need Help?

- Check [Supabase Authentication Settings](https://supabase.com/dashboard/project/dbwepxwwnauhvptxqqic/auth/providers) to configure your auth providers
- View [Database Tables](https://supabase.com/dashboard/project/dbwepxwwnauhvptxqqic/editor) to see all your data
- Visit [Edge Functions](https://supabase.com/dashboard/project/dbwepxwwnauhvptxqqic/functions) for backend logic

## Important Notes

- **Dev Admin Mode has been removed** - all authentication is now through Supabase
- **RLS Policies are active** - data is secured with Row Level Security
- **Real-time features enabled** - order updates, notifications work live
- The scanner landing page is back at `/` showing "Welcome to SmartServe" with Table 1
