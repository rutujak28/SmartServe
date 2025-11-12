import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge, OrderStatus } from '@/components/admin/StatusBadge';
import { AdminButton } from '@/components/admin/AdminButton';
import { Modal } from '@/components/admin/Modal';
import { MetricCard } from '@/components/admin/charts/MetricCard';
import { NotificationPanel } from '@/components/admin/NotificationPanel';
import { QuickActions } from '@/components/admin/QuickActions';
import { ShoppingBag, DollarSign, Clock, CheckCircle, RefreshCw, UtensilsCrossed, Star, MessageSquare } from 'lucide-react';
import { orderService } from '@/lib/services/orderService';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OrderWithDetails {
  id: string;
  customer: string;
  table: string;
  items: number;
  total: string;
  status: OrderStatus;
  time: string;
  order_items?: any[];
}

interface Statistics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  pending_orders: number;
  completed_orders: number;
  active_menu_items?: number;
}

export default function Dashboard() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestFeedback, setLatestFeedback] = useState<any[]>([]);

  // Fetch initial data
  useEffect(() => {
    fetchDashboardData();

    // Real-time subscription for orders
    const ordersChannel = supabase
      .channel('dashboard-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        () => {
          console.log('New order detected on dashboard');
          fetchDashboardData();
          toast.success('New order placed!');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        () => {
          console.log('Order updated on dashboard');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Real-time subscription for feedback
    const feedbackChannel = supabase
      .channel('dashboard-feedback-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback',
        },
        () => {
          fetchDashboardData();
          toast.success("New feedback received!");
        }
      )
      .subscribe();

    // Real-time subscription for payments
    const paymentsChannel = supabase
      .channel('dashboard-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          console.log('Payment update detected on dashboard');
          fetchDashboardData();
        }
      )
      .subscribe();

    // Real-time subscription for menu items
    const menuChannel = supabase
      .channel('dashboard-menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
        },
        () => {
          console.log('Menu items changed');
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(feedbackChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(menuChannel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with user and table details - most recent first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          table_number,
          created_at,
          user_id,
          profiles:user_id (
            full_name
          ),
          order_items (
            id,
            quantity,
            menu_item_id,
            menu_items (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        throw ordersError;
      }

      // Transform orders data with proper null checks
      const transformedOrders: OrderWithDetails[] = (ordersData || []).map((order: any) => {
        const itemCount = order.order_items?.length || 0;
        const totalAmount = parseFloat(order.total_amount || 0);
        
        return {
          id: order.id.substring(0, 8),
          customer: order.profiles?.full_name || 'Guest',
          table: order.table_number || 'N/A',
          items: itemCount,
          total: `₹${totalAmount.toFixed(2)}`,
          status: order.status as OrderStatus,
          time: format(new Date(order.created_at), 'hh:mm a'),
          order_items: order.order_items,
        };
      });

      setOrders(transformedOrders);

      // Fetch statistics
      const statsArray = await orderService.getOrderStatistics();
      if (statsArray && statsArray.length > 0) {
        setStatistics(statsArray[0]);
      }

      // Fetch active menu items count
      const { count: menuCount, error: menuError } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true);

      if (menuError) throw menuError;

      // Add menu count to statistics
      if (statsArray && statsArray.length > 0) {
        setStatistics({
          ...statsArray[0],
          active_menu_items: menuCount || 0
        } as any);
      }

      // Fetch latest feedback with user details and order info
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          order_id,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (feedbackError) {
        console.error('Feedback fetch error:', feedbackError);
        throw feedbackError;
      }

      setLatestFeedback(feedbackData || []);
      
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = statistics ? [
    {
      title: 'Total Orders',
      value: statistics.total_orders.toString(),
      icon: ShoppingBag,
      color: 'text-admin-primary',
      bgColor: 'bg-admin-primary/10',
    },
    {
      title: 'Revenue',
      value: `₹${parseFloat(statistics.total_revenue.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-admin-success',
      bgColor: 'bg-admin-success/10',
    },
    {
      title: 'Active Menu Items',
      value: statistics.active_menu_items?.toString() || '0',
      icon: UtensilsCrossed,
      color: 'text-admin-primary',
      bgColor: 'bg-admin-primary/10',
    },
    {
      title: 'Active Orders',
      value: statistics.pending_orders.toString(),
      icon: Clock,
      color: 'text-admin-warning',
      bgColor: 'bg-admin-warning/10',
    },
  ] : [];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const orderColumns: Column<OrderWithDetails>[] = [
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'table', label: 'Table', sortable: true },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (order) => <StatusBadge status={order.status} />
    },
    { key: 'time', label: 'Time', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={() => setSelectedOrder(order)}
        >
          View
        </AdminButton>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Here's a real-time overview of your canteen operations.
            </p>
          </div>
          <AdminButton 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </AdminButton>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <MetricCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <QuickActions />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                ) : (
                  <DataTable
                    data={orders}
                    columns={orderColumns}
                    searchPlaceholder="Search orders..."
                    pageSize={5}
                    emptyMessage="No orders found"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Latest Feedback & Notifications */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Latest Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestFeedback.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No feedback yet
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {latestFeedback.map((feedback) => (
                      <div key={feedback.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {feedback.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {feedback.profiles?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Order #{feedback.order_id?.substring(0, 8)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                {renderStars(feedback.rating)}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(feedback.created_at), 'MMM dd, hh:mm a')}
                                </p>
                              </div>
                            </div>
                            {feedback.review_text && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-2 italic">
                                "{feedback.review_text}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <NotificationPanel />
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
          description={`Order ${selectedOrder.id}`}
          size="md"
          footer={
            <div className="flex gap-2 w-full">
              <AdminButton
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="flex-1"
              >
                Close
              </AdminButton>
              <AdminButton variant="primary" className="flex-1">
                Update Status
              </AdminButton>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedOrder.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Table</p>
                <p className="font-medium">{selectedOrder.table}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-medium">{selectedOrder.items} items</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-medium">{selectedOrder.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{selectedOrder.time}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
