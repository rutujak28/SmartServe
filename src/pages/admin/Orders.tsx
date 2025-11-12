import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, Column } from '@/components/admin/DataTable';
import { StatusBadge, OrderStatus } from '@/components/admin/StatusBadge';
import { AdminButton } from '@/components/admin/AdminButton';
import { Modal } from '@/components/admin/Modal';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Printer,
  MessageSquare,
  Clock,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { orderService } from '@/lib/services/orderService';
import { OrderWithItems } from '@/lib/types/database';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface OrderDisplay {
  id: string;
  fullId: string;
  customer: string;
  table: string;
  items: number;
  total: string;
  status: OrderStatus;
  time: string;
  paymentMethod: string;
  specialInstructions?: string;
  orderItems: { name: string; quantity: number; price: string }[];
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchOrders();
          if (payload.eventType === 'INSERT') {
            toast.success('New order received from customer!');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Order status updated');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      
      const transformedOrders: OrderDisplay[] = data.map((order: OrderWithItems) => ({
        id: order.id.substring(0, 8),
        fullId: order.id,
        customer: order.user_id || 'Guest',
        table: order.table_number,
        items: order.order_items?.length || 0,
        total: `₹${parseFloat(order.total_amount.toString()).toFixed(2)}`,
        status: order.status as OrderStatus,
        time: format(new Date(order.created_at), 'hh:mm a'),
        paymentMethod: order.payment_method || 'N/A',
        specialInstructions: order.special_instructions || undefined,
        orderItems: order.order_items?.map((item: any) => ({
          name: item.menu_item?.name || 'Unknown',
          quantity: item.quantity,
          price: `₹${parseFloat(item.total_price.toString()).toFixed(2)}`
        })) || []
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const orderColumns: Column<OrderDisplay>[] = [
    { key: 'id', label: 'Order ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'table', label: 'Table', sortable: true },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'total', label: 'Total', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => <StatusBadge status={order.status} />,
    },
    { key: 'time', label: 'Time', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <div className="flex gap-2">
          <AdminButton variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
            View
          </AdminButton>
          <AdminButton variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </AdminButton>
        </div>
      ),
    },
  ];

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      served: orders.filter((o) => o.status === 'served').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Orders' }]}>
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Orders' }]}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-2">Manage and track all canteen orders.</p>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export
            </AdminButton>
            <AdminButton variant="primary">
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </AdminButton>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">
              All Orders
              <Badge variant="secondary" className="ml-2">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {statusCounts.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing
              <Badge variant="secondary" className="ml-2">
                {statusCounts.preparing}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready
              <Badge variant="secondary" className="ml-2">
                {statusCounts.ready}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="served">
              Served
              <Badge variant="secondary" className="ml-2">
                {statusCounts.served}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  data={filteredOrders}
                  columns={orderColumns}
                  searchPlaceholder="Search orders..."
                  pageSize={10}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
          description={`Order ${selectedOrder.id} - ${selectedOrder.time}`}
          size="lg"
          footer={
            <div className="flex gap-2 w-full">
              <AdminButton variant="outline" onClick={() => setSelectedOrder(null)} className="flex-1">
                Close
              </AdminButton>
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'served' && (
                <AdminButton 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => handleCancelOrder(selectedOrder.fullId)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </AdminButton>
              )}
            </div>
          }
        >
          <div className="space-y-6">
            {/* Customer & Table Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Table</p>
                  <p className="font-medium">{selectedOrder.table}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Order Time</p>
                  <p className="font-medium">{selectedOrder.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Status</label>
              <Select 
                defaultValue={selectedOrder.status}
                onValueChange={(value) => handleUpdateStatus(selectedOrder.fullId, value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Items</h3>
              <div className="space-y-2">
                {selectedOrder.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.price}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <p className="font-semibold">Total</p>
                <p className="text-xl font-bold">{selectedOrder.total}</p>
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.specialInstructions && (
              <div className="space-y-2">
                <h3 className="font-semibold">Special Instructions</h3>
                <div className="p-3 rounded-lg bg-admin-warning/10 border border-admin-warning/20">
                  <p className="text-sm">{selectedOrder.specialInstructions}</p>
                </div>
              </div>
            )}

            {/* Kitchen Communication */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kitchen Communication
              </h3>
              <Textarea
                placeholder="Send message to kitchen staff..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <AdminButton variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </AdminButton>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
