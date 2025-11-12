import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/lib/services/wishlistService';
import { toast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await wishlistService.getWishlist(user.id);
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (menuItemId: string) => {
    if (!user) return;
    try {
      await wishlistService.removeFromWishlist(user.id, menuItemId);
      setWishlistItems(wishlistItems.filter(item => item.menu_item_id !== menuItemId));
      toast({
        title: 'Removed',
        description: 'Item removed from wishlist',
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const addToCart = (item: WishlistItem) => {
    addItem({
      id: item.menu_item_id,
      name: item.name,
      price: Number(item.price),
      image: item.image,
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} added to cart`,
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Heart className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground text-center mb-6">
            Please login to view your wishlist
          </p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </MainLayout>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Heart className="w-24 h-24 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground text-center mb-6">
            Save your favorite items here for later
          </p>
          <Button onClick={() => navigate('/home')}>Browse Menu</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Wishlist</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-5 h-5" />
            <span>{wishlistItems.length} items</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-muted text-muted-foreground">
                    No image
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 shadow-lg"
                  onClick={() => removeFromWishlist(item.menu_item_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.category || 'Delicious'}</p>
                  <p className="text-xl font-bold text-primary">₹{item.price}</p>
                </div>
                <Button
                  className="w-full shadow-md hover:shadow-lg transition-all"
                  onClick={() => addToCart(item)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
