import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/types/database';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  roles: UserRole[];
  created_at: string;
  order_count?: number;
}

export const userService = {
  async getAllUsers() {
    // Get all auth users first
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) throw usersError;

    // Fetch profiles and roles for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name,
          phone: profile?.phone,
          avatar_url: profile?.avatar_url,
          roles: rolesData?.map(r => r.role as UserRole) || [],
          created_at: user.created_at,
          order_count: count || 0,
        };
      })
    );

    return usersWithDetails as UserProfile[];
  },

  async getUserProfile(userId: string) {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) throw userError;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    return {
      id: userId,
      email: user.email,
      full_name: profile?.full_name,
      phone: profile?.phone,
      avatar_url: profile?.avatar_url,
      roles: rolesData?.map(r => r.role as UserRole) || [],
      created_at: user.created_at,
    } as UserProfile;
  },

  async updateUserRole(userId: string, role: UserRole, action: 'add' | 'remove') {
    if (action === 'add') {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    }
  },

  async getUserOrderHistory(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(*)
        ),
        payment:payments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
