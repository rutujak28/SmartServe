import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { FeedbackModal } from '@/components/feedback/FeedbackModal';
import { orderService } from '@/lib/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { paymentMethod, splitPayment } = location.state || {};
  const [showFeedback, setShowFeedback] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const displayOrderId = `SS${Date.now().toString().slice(-8)}`;
  const estimatedTime = '15-20 minutes';

  useEffect(() => {
    const createOrder = async () => {
      if (!user) {
        toast.error('User not authenticated');
        navigate('/login');
        return;
      }

      if (items.length === 0) {
        toast.error('No items in cart');
        navigate('/home');
        return;
      }

      try {
        setLoading(true);
        const tableNumber = sessionStorage.getItem('smartserve-table') || '1';
        const subtotal = totalPrice;
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        // Create order in database
        const order = await orderService.createOrder(
          {
            user_id: user.id,
            table_number: tableNumber,
            subtotal: subtotal,
            tax_amount: tax,
            total_amount: total,
            status: 'pending',
            payment_method: paymentMethod === 'cod' ? 'cash' : splitPayment ? 'split' : 'upi',
            estimated_preparation_time: 15,
          },
          items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
            item_status: 'pending',
          }))
        );

        setOrderId(order.id);
        toast.success('Order placed successfully!');
        
        // Clear cart after successful order creation
        clearCart();
        
        // Show feedback modal after a short delay
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
      } catch (error) {
        console.error('Error creating order:', error);
        toast.error('Failed to create order. Please contact staff.');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    createOrder();
  }, []);

  if (loading || !orderId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-accent" />
          </div>

          <h1 className="text-3xl font-bold mb-2 text-center">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            Your order has been placed successfully
          </p>

          <Card className="w-full mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold">{displayOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : splitPayment ? 'Split Payment' : 'Online Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-semibold">{estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Table Number</span>
                <span className="font-semibold">{sessionStorage.getItem('smartserve-table')}</span>
              </div>
            </CardContent>
          </Card>

          <div className="w-full space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate(`/orders/track/${displayOrderId}`)}
            >
              Track Order
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/home')}
            >
              Back to Menu
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            We'll notify you when your order is ready
          </p>
        </div>
      </div>

      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
        orderId={orderId} 
      />
    </MainLayout>
  );
}
