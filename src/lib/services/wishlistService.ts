import { supabase } from '@/integrations/supabase/client';

export const wishlistService = {
  // Get user's wishlist items
  async getWishlist(userId: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  // Add item to wishlist
  async addToWishlist(userId: string, menuItemId: string, name: string, price: number, image?: string, category?: string) {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        menu_item_id: menuItemId,
        name,
        price,
        image,
        category,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove item from wishlist
  async removeFromWishlist(userId: string, menuItemId: string) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);

    if (error) throw error;
  },

  // Check if item is in wishlist
  async isInWishlist(userId: string, menuItemId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
