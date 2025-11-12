import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminButton } from '@/components/admin/AdminButton';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Bell,
  ChefHat,
  RefreshCw
} from 'lucide-react';
import { orderService } from '@/lib/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems, OrderStatus } from '@/lib/types/database';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const previousOrderCount = useRef(0);

  // Fetch initial orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `status=in.(pending,confirmed,preparing)`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrders();
            playNotificationSound();
          } else if (payload.eventType === 'UPDATE') {
            fetchOrders();
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(o => o.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Play sound for new orders
  useEffect(() => {
    if (orders.length > previousOrderCount.current && previousOrderCount.current > 0) {
      playNotificationSound();
    }
    previousOrderCount.current = orders.length;
  }, [orders.length]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      // Filter only active orders for kitchen
      const activeOrders = data.filter(
        order => ['pending', 'confirmed', 'preparing'].includes(order.status)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    if (audioEnabled) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      toast.info('New order received!', {
        icon: '🔔',
      });
    }
  };

  const toggleItemComplete = async (orderId: string, itemId: string, currentStatus: string) => {
    try {
      setUpdating(itemId);
      const newStatus = currentStatus === 'ready' ? 'preparing' : 'ready';
      await orderService.updateOrderItemStatus(itemId, newStatus as OrderStatus);
      
      // Update local state optimistically
      setOrders(orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            order_items: order.order_items.map(item =>
              item.id === itemId ? { ...item, item_status: newStatus as OrderStatus } : item
            ),
          };
        }
        return order;
      }));
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setUpdating(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'preparing' | 'ready' | 'served') => {
    try {
      setUpdating(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      
      if (newStatus === 'ready' || newStatus === 'served') {
        setOrders(orders.filter(o => o.id !== orderId));
        toast.success(`Order marked as ${newStatus}!`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const startPreparation = async (orderId: string) => {
    await updateOrderStatus(orderId, 'preparing');
  };

  const markOrderReady = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready');
  };

  const getPriorityLevel = (order: OrderWithItems): 'high' | 'medium' | 'low' => {
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const minutesElapsed = (now.getTime() - orderTime.getTime()) / 1000 / 60;
    
    if (minutesElapsed > 20) return 'high';
    if (minutesElapsed > 10) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-admin-destructive bg-admin-destructive/5';
      case 'medium':
        return 'border-admin-warning bg-admin-warning/5';
      default:
        return 'border-border bg-card';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-admin-warning text-white">Priority</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const allItemsCompleted = (order: OrderWithItems) => {
    return order.order_items?.every(item => item.item_status === 'ready') ?? false;
  };

  const getOrderElapsedTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Kitchen Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-admin-primary/10">
              <ChefHat className="h-8 w-8 text-admin-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Kitchen Display</h1>
              <p className="text-lg text-muted-foreground mt-1">Active Orders: {orders.length}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <AdminButton
              variant="outline"
              size="lg"
              onClick={fetchOrders}
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </AdminButton>
            <AdminButton
              variant={audioEnabled ? 'primary' : 'outline'}
              size="lg"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              <Bell className="h-5 w-5 mr-2" />
              {audioEnabled ? 'Sound On' : 'Sound Off'}
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => {
          const priority = getPriorityLevel(order);
          const isCompleted = allItemsCompleted(order);
          
          return (
            <Card
              key={order.id}
              className={`${getPriorityColor(priority)} border-2 transition-all hover:shadow-lg`}
            >
              <CardContent className="p-6 space-y-4">
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">#{order.id.slice(0, 8)}</h3>
                    <p className="text-lg text-muted-foreground">Table {order.table_number}</p>
                  </div>
                  {getPriorityBadge(priority)}
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
                  <Clock className="h-5 w-5 text-admin-warning" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Order Time</p>
                    <p className="text-base font-semibold">{getOrderElapsedTime(order.created_at)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-admin-warning/10 border border-admin-warning/20">
                    <AlertCircle className="h-5 w-5 text-admin-warning mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Special Instructions</p>
                      <p className="text-sm">{order.special_instructions}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Items:</p>
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-background touch-manipulation"
                    >
                      <Checkbox
                        checked={item.item_status === 'ready'}
                        onCheckedChange={() => toggleItemComplete(order.id, item.id, item.item_status)}
                        disabled={updating === item.id}
                        className="h-6 w-6 touch-manipulation"
                      />
                      <div className="flex-1">
                        <p className={`font-medium text-base ${item.item_status === 'ready' ? 'line-through text-muted-foreground' : ''}`}>
                          {item.menu_item?.name || 'Item'}
                        </p>
                        {item.special_instructions && (
                          <p className="text-xs text-admin-warning mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1.5 font-semibold">
                        x{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <AdminButton
                      variant="primary"
                      size="lg"
                      className="w-full touch-manipulation"
                      disabled={updating === order.id}
                      onClick={() => startPreparation(order.id)}
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Start Preparation
                    </AdminButton>
                  )}
                  
                  {order.status === 'preparing' && (
                    <AdminButton
                      variant={isCompleted ? 'success' : 'outline'}
                      size="lg"
                      className="w-full touch-manipulation"
                      disabled={!isCompleted || updating === order.id}
                      onClick={() => markOrderReady(order.id)}
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      {isCompleted ? 'Mark as Ready' : 'Complete All Items First'}
                    </AdminButton>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-block p-6 rounded-full bg-admin-success/10 mb-4">
            <CheckCircle2 className="h-16 w-16 text-admin-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
          <p className="text-muted-foreground">No pending orders at the moment.</p>
        </div>
      )}
    </div>
  );
}
