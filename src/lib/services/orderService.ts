import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderWithItems } from '@/lib/types/database';

export const orderService = {
  async getOrders(userId?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_item:menu_items(*)
        ),
        payment:payments(*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as OrderWithItems[];
  },

  async getOrder(orderId: string) {
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
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data as OrderWithItems;
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'completed_at'>, items: Partial<OrderItem>[]) {
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      menu_item_id: item.menu_item_id!,
      quantity: item.quantity!,
      unit_price: item.unit_price!,
      total_price: item.total_price!,
      special_instructions: item.special_instructions,
      item_status: item.item_status || 'pending' as const,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderData as Order;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const updates: Partial<Order> = { status };
    
    if (status === 'served') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updateOrderItemStatus(itemId: string, status: OrderItem['item_status']) {
    const { data, error } = await supabase
      .from('order_items')
      .update({ item_status: status })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data as OrderItem;
  },

  async cancelOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  // Real-time subscription for orders
  subscribeToOrders(callback: (order: Order) => void) {
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          callback(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getOrderStatistics(startDate?: string, endDate?: string) {
    const { data, error } = await supabase
      .rpc('get_order_statistics', {
        start_date: startDate || null,
        end_date: endDate || null,
      });

    if (error) throw error;
    return data;
  },
};
