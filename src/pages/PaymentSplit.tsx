import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calculator, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentSplit() {
  const { totalPrice } = useCart();
  const navigate = useNavigate();
  const total = totalPrice * 1.05;

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

        <h1 className="text-3xl font-bold mb-6">Split the Bill</h1>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/payment/split/equal')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Split Equally</h3>
                  <p className="text-sm text-muted-foreground">Divide the bill equally among all people</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/payment/split/custom')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Custom Split</h3>
                  <p className="text-sm text-muted-foreground">Assign items to specific people</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
