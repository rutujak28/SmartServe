import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function ScanQR() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manualTableNumber, setManualTableNumber] = useState('');
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (tableId) {
      // Validate table ID (in real app, this would be an API call)
      setTimeout(() => {
        setIsValidating(false);
        // Store table number in sessionStorage
        sessionStorage.setItem('smartserve-table', tableId);
      }, 1000);
    } else {
      setIsValidating(false);
    }
  }, [tableId]);

  const handleProceed = () => {
    if (tableId || manualTableNumber) {
      const table = tableId || manualTableNumber;
      sessionStorage.setItem('smartserve-table', table);
      // Check if user is logged in
      if (user) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }
  };

  if (isValidating && tableId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <QrCode className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Validating table number...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to SmartServe!</CardTitle>
          <CardDescription>
            {tableId
              ? `Table ${tableId} confirmed`
              : 'Scan the QR code on your table or enter the table number manually'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableId ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Table</p>
                <p className="text-3xl font-bold text-accent">#{tableId}</p>
              </div>
              <Button onClick={handleProceed} className="w-full" size="lg">
                Continue to Menu
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  type="text"
                  placeholder="Enter table number"
                  value={manualTableNumber}
                  onChange={(e) => setManualTableNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleProceed}
                disabled={!manualTableNumber}
                className="w-full"
                size="lg"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
