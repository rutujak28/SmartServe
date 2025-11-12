import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentOptions() {
  const { totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const tableNumber = sessionStorage.getItem('smartserve-table') || '';

  const total = totalPrice * 1.05;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/cart')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-bold mb-6">Payment Options</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Items ({totalItems})</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (5%)</span>
                <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-4">
                <span>Table Number</span>
                <span className="font-semibold">{tableNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/payment/full')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Pay Full Amount</h3>
                  <p className="text-sm text-muted-foreground">Pay the complete bill amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/payment/split')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Split the Bill</h3>
                  <p className="text-sm text-muted-foreground">Share the bill with others</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
