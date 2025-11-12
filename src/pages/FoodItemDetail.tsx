import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuantitySelector } from '@/components/food/QuantitySelector';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

// Mock data - replace with API call
const mockFoodItems: Record<string, any> = {
  '1': { id: '1', name: 'Masala Dosa', description: 'Crispy dosa with spicy potato filling', price: 60, image: '', ingredients: 'Rice, Potato, Spices, Oil', rating: 4.5, reviews: 120 },
  '2': { id: '2', name: 'Idli Sambar', description: 'Soft idlis served with sambar and chutney', price: 50, image: '', ingredients: 'Rice, Urad Dal, Sambar', rating: 4.8, reviews: 200 },
  '3': { id: '3', name: 'Paneer Butter Masala', description: 'Rich and creamy paneer curry', price: 120, image: '', ingredients: 'Paneer, Butter, Cream, Tomatoes', rating: 4.6, reviews: 150 },
};

export default function FoodItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const item = itemId ? mockFoodItems[itemId] : null;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Item not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    }
    toast({ title: 'Added to cart', description: `${quantity}x ${item.name}` });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-card border-b z-10 p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="aspect-video bg-muted">
        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                <span className="font-semibold">{item.rating}</span>
              </div>
              <span>({item.reviews} reviews)</span>
            </div>
          </div>
          <span className="text-2xl font-bold text-primary">₹{item.price}</span>
        </div>

        <p className="text-muted-foreground mb-6">{item.description}</p>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <p className="text-sm text-muted-foreground">{item.ingredients}</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="font-semibold">Quantity:</span>
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
            onIncrease={() => setQuantity(q => q + 1)}
          />
        </div>

        <Button onClick={handleAddToCart} size="lg" className="w-full">
          Add to Cart - ₹{(item.price * quantity).toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
