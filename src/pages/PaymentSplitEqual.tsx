import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function PaymentSplitEqual() {
  const { totalPrice } = useCart();
  const navigate = useNavigate();
  const [numPeople, setNumPeople] = useState<string>('2');
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [paidPeople, setPaidPeople] = useState<number[]>([]);

  const total = totalPrice * 1.05;
  const perPersonAmount = numPeople ? total / parseInt(numPeople) : 0;

  const handleContinue = () => {
    const num = parseInt(numPeople);
    if (!num || num < 2 || num > 100) {
      toast({ title: 'Invalid number', description: 'Please enter between 2-100 people', variant: 'destructive' });
      return;
    }
    setShowQRCodes(true);
  };

  const handlePaymentComplete = (personIndex: number) => {
    setPaidPeople([...paidPeople, personIndex]);
    
    if (paidPeople.length + 1 === parseInt(numPeople)) {
      setTimeout(() => {
        navigate('/payment/success', { state: { splitPayment: true } });
      }, 1000);
    }
  };

  if (!showQRCodes) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/payment/split')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-bold mb-6">Split Equally</h1>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="numPeople">Number of People</Label>
                  <Input
                    id="numPeople"
                    type="number"
                    min="2"
                    max="100"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Enter between 2-100 people</p>
                </div>

                {numPeople && parseInt(numPeople) >= 2 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Per Person</span>
                      <span>₹{perPersonAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </MainLayout>
    );
  }

  const progressPercentage = (paidPeople.length / parseInt(numPeople)) * 100;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Payment Progress</h1>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Payments Completed</span>
                  <span className="font-semibold">{paidPeople.length} / {numPeople}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Array.from({ length: parseInt(numPeople) }, (_, i) => i + 1).map((person) => (
            <Card key={person} className={paidPeople.includes(person) ? 'border-accent' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Person {person}</span>
                  {paidPeople.includes(person) && (
                    <div className="flex items-center gap-2 text-accent">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Paid</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!paidPeople.includes(person) ? (
                  <div className="space-y-4">
                    <div className="flex justify-center p-4 bg-background border rounded-lg">
                      <QRCodeSVG
                        value={`upi://pay?pa=smartserve@upi&pn=SmartServe&am=${perPersonAmount.toFixed(2)}&cu=INR&tn=Order Payment Person ${person}`}
                        size={200}
                        level="H"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">₹{perPersonAmount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground mt-1">Scan QR code to pay</p>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePaymentComplete(person)}
                    >
                      Mark as Paid (Demo)
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                      <Check className="w-8 h-8 text-accent" />
                    </div>
                    <p className="font-semibold text-accent">Payment Completed</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
