import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuantitySelector } from '@/components/food/QuantitySelector';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const [tableNumber, setTableNumber] = useState(sessionStorage.getItem('smartserve-table') || '');

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <ShoppingBag className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Add some delicious items from the menu
          </p>
          <Button onClick={() => navigate('/home')}>Browse Menu</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        <div className="space-y-4 mb-6">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <QuantitySelector
                        quantity={item.quantity}
                        onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                        onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                      <span className="font-bold text-lg">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (5%)</span>
                <span>₹{(totalPrice * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(totalPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <Label htmlFor="tableNumber">Table Number *</Label>
          <Input
            id="tableNumber"
            type="text"
            placeholder="Enter your table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="mt-2"
            required
          />
        </div>

        <Button 
          className="w-full" 
          size="lg"
          disabled={!tableNumber}
          onClick={() => {
            if (!tableNumber) {
              toast({ title: 'Table number required', description: 'Please enter your table number', variant: 'destructive' });
              return;
            }
            sessionStorage.setItem('smartserve-table', tableNumber);
            navigate('/payment');
          }}
        >
          Proceed to Checkout
        </Button>
      </div>
    </MainLayout>
  );
}
