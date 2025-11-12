import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentFull() {
  const { totalPrice } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const tableNumber = sessionStorage.getItem('smartserve-table') || '';

  const total = totalPrice * 1.05;

  const handlePayment = () => {
    if (paymentMethod === 'online') {
      navigate('/payment/processing', { state: { amount: total, splitType: 'full' } });
    } else {
      navigate('/payment/success', { state: { paymentMethod: 'cod' } });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/payment')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Payment Method</h1>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Table Number</span>
                <span className="font-semibold">{tableNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'online' | 'cod')} className="space-y-4 mb-6">
          <Card className={paymentMethod === 'online' ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">UPI / Online Payment</p>
                    <p className="text-sm text-muted-foreground">Pay using UPI, Cards, Net Banking</p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className={paymentMethod === 'cod' ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Pay with cash when order arrives</p>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>

        <Button className="w-full" size="lg" onClick={handlePayment}>
          {paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order'}
        </Button>
      </div>
    </MainLayout>
  );
}
