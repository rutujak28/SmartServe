import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/lib/types/database';

export const menuService = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data as MenuCategory[];
  },

  async createCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  async updateCategory(id: string, updates: Partial<MenuCategory>) {
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuCategory;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Menu Items
  async getMenuItems(categoryId?: string) {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(*)
      `)
      .eq('is_available', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as MenuItem[];
  },

  async getMenuItem(id: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as MenuItem;
  },

  async createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuItem;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MenuItem;
  },

  async deleteMenuItem(id: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async searchMenuItems(searchTerm: string) {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(*)
      `)
      .ilike('name', `%${searchTerm}%`)
      .eq('is_available', true);
    
    if (error) throw error;
    return data as MenuItem[];
  },

  // Image upload
  async uploadMenuImage(file: File, itemId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}-${Date.now()}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteMenuImage(imageUrl: string) {
    const path = imageUrl.split('/menu-images/').pop();
    if (!path) return;

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([path]);

    if (error) throw error;
  }
};
