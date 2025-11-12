import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { FoodItemCard } from '@/components/food/FoodItemCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Search as SearchIcon } from 'lucide-react';
import { menuService } from '@/lib/services/menuService';
import { wishlistService } from '@/lib/services/wishlistService';
import type { MenuItem } from '@/lib/types/database';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    loadMenuData();
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const items = await menuService.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user) return;
    try {
      const wishlist = await wishlistService.getWishlist(user.id);
      setWishlistItems(new Set(wishlist.map(item => item.menu_item_id)));
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: MenuItem) => {
    addItem({ 
      id: item.id, 
      name: item.name, 
      price: Number(item.price),
      image: item.image_url || '',
    });
    toast({ title: 'Added to cart', description: `${item.name} has been added` });
  };

  const handleToggleWishlist = async (item: MenuItem) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to wishlist',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isWishlisted = wishlistItems.has(item.id);
      
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(user.id, item.id);
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
        toast({
          title: 'Removed from wishlist',
          description: `${item.name} has been removed from your wishlist`,
        });
      } else {
        await wishlistService.addToWishlist(
          user.id,
          item.id,
          item.name,
          Number(item.price),
          item.image_url || undefined
        );
        setWishlistItems(prev => new Set([...prev, item.id]));
        toast({
          title: 'Added to wishlist',
          description: `${item.name} has been added to your wishlist`,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout showSearch onSearchChange={setSearchQuery} searchValue={searchQuery}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSearch onSearchChange={setSearchQuery} searchValue={searchQuery}>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Items'}
        </h1>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <FoodItemCard 
                key={item.id} 
                id={item.id}
                name={item.name}
                description={item.description || ''}
                price={Number(item.price)}
                image={item.image_url || ''}
                isWishlisted={wishlistItems.has(item.id)}
                onAddToCart={() => handleAddToCart(item)}
                onToggleWishlist={() => handleToggleWishlist(item)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <SearchIcon className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
