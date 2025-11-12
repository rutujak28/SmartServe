import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, ShoppingBag, Search, Star, RotateCcw } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Order {
  id: string;
  tableNumber: number;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'completed' | 'cancelled';
  date: string;
  time: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD001',
    tableNumber: 5,
    items: [
      { name: 'Masala Dosa', quantity: 2, price: 80 },
      { name: 'Filter Coffee', quantity: 2, price: 40 },
    ],
    total: 240,
    status: 'completed',
    date: '2025-01-20',
    time: '10:30 AM',
  },
  {
    id: 'ORD002',
    tableNumber: 12,
    items: [
      { name: 'Veg Biryani', quantity: 1, price: 180 },
      { name: 'Raita', quantity: 1, price: 40 },
    ],
    total: 220,
    status: 'completed',
    date: '2025-01-18',
    time: '1:15 PM',
  },
];

export default function Orders() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach((item, index) => {
      const itemId = `${Date.now()}-${index}`;
      addItem({
        id: itemId,
        name: item.name,
        price: item.price,
        image: '/placeholder.svg',
      });
      // Add multiple times if quantity > 1
      for (let i = 1; i < item.quantity; i++) {
        addItem({
          id: itemId,
          name: item.name,
          price: item.price,
          image: '/placeholder.svg',
        });
      }
    });
    navigate('/cart');
  };

  if (orders.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground text-center mb-6">
            Your order history will appear here
          </p>
          <Button onClick={() => navigate('/home')}>Start Shopping</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-3xl font-bold">Order History</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.date} • {order.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Table {order.tableNumber}
                      </div>
                    </div>
                  </div>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>

                {expandedOrder === order.id && (
                  <div className="space-y-2 mb-3 p-3 bg-muted rounded-lg">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="text-lg font-bold ml-2">₹{order.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      {expandedOrder === order.id ? 'Hide' : 'View'} Details
                    </Button>
                    {order.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reorder
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/feedback?orderId=${order.id}`)}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Rate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found matching your criteria</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
