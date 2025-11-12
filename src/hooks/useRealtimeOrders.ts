import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types/database';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useRealtimeOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload: RealtimePostgresChangesPayload<Order>) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? (payload.new as Order) : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) =>
              prev.filter((order) => order.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { orders, loading };
};
