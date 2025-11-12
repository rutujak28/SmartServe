import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ChefHat, MessageCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

type OrderStatus = 'ordered' | 'preparing' | 'ready';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>('ordered');

  // Simulate order progression
  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('preparing'), 3000);
    const timer2 = setTimeout(() => setStatus('ready'), 8000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const statusSteps = [
    { key: 'ordered', label: 'Order Placed', icon: CheckCircle2 },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready to Serve', icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const mockItems = [
    { name: 'Masala Dosa', quantity: 2, price: 80 },
    { name: 'Filter Coffee', quantity: 2, price: 40 },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-6">Order ID: {orderId}</p>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Status</CardTitle>
              <Badge variant={status === 'ready' ? 'default' : 'secondary'}>
                {status === 'ordered' && 'Received'}
                {status === 'preparing' && 'In Progress'}
                {status === 'ready' && 'Ready'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= getCurrentStepIndex();
                const isCurrent = index === getCurrentStepIndex();

                return (
                  <div key={step.key} className="relative">
                    {index > 0 && (
                      <div 
                        className={`absolute left-6 -top-8 w-0.5 h-8 transition-colors ${
                          isActive ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                    <div className="flex items-center gap-4 mb-6 last:mb-0">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCurrent && status !== 'ready' ? (
                          <Clock className="w-6 h-6 animate-pulse" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-muted-foreground">
                            {status === 'ordered' && 'Your order has been received'}
                            {status === 'preparing' && 'Our chefs are preparing your food'}
                            {status === 'ready' && 'Your order is ready!'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {status === 'ready' && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                <p className="font-semibold text-accent text-center">
                  🎉 Your order is ready! Please collect from the counter.
                </p>
              </div>
            )}

            {status !== 'ready' && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  Estimated time: <span className="font-semibold">12-15 minutes</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">₹{item.price}</span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{mockItems.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" size="lg">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat with Kitchen
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/home')}>
            Back to Menu
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
