import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartSummaryBar = () => {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-primary text-primary-foreground p-4 shadow-lg z-40 safe-area-bottom">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">{totalItems} items</p>
            <p className="text-lg font-bold">₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/cart')}
          className="font-semibold"
        >
          View Cart
        </Button>
      </div>
    </div>
  );
};
