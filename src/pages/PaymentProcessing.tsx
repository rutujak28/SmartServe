import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PaymentProcessing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { amount } = location.state || { amount: 0 };
  const [status, setStatus] = useState<'loading' | 'qr'>('loading');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStatus('qr');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handlePaymentComplete = () => {
    navigate('/payment/success');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Payment Processing</h1>

        {status === 'loading' ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Initializing secure payment...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">Secure Payment via Razorpay</span>
                </div>

                <div className="flex justify-center p-6 bg-background border-2 border-primary/20 rounded-lg mb-6">
                  <QRCodeSVG
                    value={`upi://pay?pa=smartserve@razorpay&pn=SmartServe&am=${amount.toFixed(2)}&cu=INR&tn=Order Payment`}
                    size={250}
                    level="H"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-3xl font-bold text-primary">₹{amount.toFixed(2)}</p>
                  <p className="text-muted-foreground">Scan QR code with any UPI app</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">Google Pay</span>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">PhonePe</span>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">Paytm</span>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full">BHIM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for payment confirmation...</span>
            </div>

            <Button className="w-full" size="lg" onClick={handlePaymentComplete}>
              Payment Completed (Demo)
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
