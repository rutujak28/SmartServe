import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategorySection } from '@/components/food/CategorySection';
import { FoodItemCard } from '@/components/food/FoodItemCard';
import { CartSummaryBar } from '@/components/cart/CartSummaryBar';
import { CategoryChip } from '@/components/food/CategoryChip';
import { CategoryFloatingButton } from '@/components/food/CategoryFloatingButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { menuService } from '@/lib/services/menuService';
import { wishlistService } from '@/lib/services/wishlistService';
import { getMenuItemImage } from '@/lib/imageMapping';
import type { MenuItem, MenuCategory } from '@/lib/types/database';
import Breakfast from '@/assets/menu/Breakfast.png';
import Lunch from '@/assets/menu/Lunch.png';
import Snacks from '@/assets/menu/Snacks.png';
import Beverages from '@/assets/menu/Beverages.png';
import Dinner from '@/assets/menu/Dinner.png';
import Chinese from '@/assets/menu/Chinese.png';
import SouthIndian from '@/assets/menu/SouthIndian.png';
import HotBeverages from '@/assets/menu/Hot Beverages.png';
import Dessert from '@/assets/menu/Dessert.png';

// --- START OF CATEGORY ICON MODIFICATIONS ---

// 1. Define the new structure for the category icon data
type CategoryIconData = {
  displayName: string;
  imageUrl: string;
  // We keep a fallback emoji/icon string for components like the floating button
  fallbackIcon: string; 
};

// 2. Update categoryIcons to use the new structure (key: category name, value: data object)
// This is where you will replace the placeholder image URLs with your chosen images.
const categoryIcons: Record<string, CategoryIconData> = {
  breakfast: { 
    displayName: 'Breakfast', 
    imageUrl: Breakfast,
    fallbackIcon: '🌅'
  },
  'lunch specials': { 
    displayName: 'Lunch Specials', 
    imageUrl: Lunch,
    fallbackIcon: '🍽️'
  },
  snacks: { 
    displayName: 'Snacks', 
    imageUrl: Snacks,
    fallbackIcon: '🍿'
  },
  beverages: { 
    displayName: 'Beverages', 
    imageUrl: Beverages,
    fallbackIcon: '☕'
  },
  chinese: { 
    displayName: 'Chinese', 
    imageUrl: Chinese,
    fallbackIcon: '🥢'
  },
  'south indian': { 
    displayName: 'South Indian', 
    imageUrl: SouthIndian,
    fallbackIcon: '🥞'
  },
};

// 3. New Component for Swiggy-style circular icon rendering
interface SwiggyCategoryIconProps {
  category: MenuCategory; // Pass the whole category object
  categoryData: CategoryIconData;
  onClick: (categoryId: string) => void;
}

const SwiggyCategoryIcon: React.FC<SwiggyCategoryIconProps> = ({ category, categoryData, onClick }) => {
  const { displayName, imageUrl } = categoryData;
  
  return (
    <div 
      className="flex flex-col items-center flex-shrink-0 cursor-pointer w-[100px] sm:w-[150px] hover:scale-200 transition duration-300"
      onClick={() => onClick(category.id)}
      role="button"
      tabIndex={0}
      aria-label={`Scroll to ${displayName} category`}
    >
      {/* Container for the circular image (w-16 h-16 + rounded-full) */}
      <div className="w-500 h-500 rounded-full overflow-hidden shadow-md border border-gray-100 hover:border-orange-500 transition duration-200">
        <img
          src={imageUrl}
          alt={displayName}
          // Ensures the image fills the circle without distortion
          className="w-full h-full object-cover" 
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src = 'https://placehold.co/100x100/F0F0F0/000000?text=Food';
            target.className = 'w-full h-full object-contain p-2';
          }}
        />
      </div>
      {/* Category Name below the icon */}
      <p className="mt-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">
        {displayName}
      </p>
    </div>
  );
};

// --- END OF CATEGORY ICON MODIFICATIONS ---

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadMenuData();
      loadWishlist();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (data?.full_name) {
      setUserName(data.full_name.split(' ')[0]);
    }
  };

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const [categoriesData, itemsData] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(),
      ]);
      setCategories(categoriesData);
      setMenuItems(itemsData);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items',
        variant: 'destructive',
      });
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

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image_url || '',
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart`,
    });
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
          item.image_url || undefined,
          categories.find(c => c.id === item.category_id)?.name
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

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveCategory(categoryId);
      setTimeout(() => setActiveCategory(null), 1500);
    }
  };

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter(item => item.category_id === categoryId);
  };

  const filterItems = (items: MenuItem[]) => {
    if (!searchQuery) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
      <div className="py-6">
        <div className="px-4 mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Welcome{userName ? `, ${userName}` : ' to SmartServe'}!
          </h1>
          <p className="text-lg text-muted-foreground">What do you wish to eat today?</p>
        </div>

        {/* Sliding Category Icons (Now using Swiggy-style images) */}
        <div className="px-4 mb-8">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase();
              const iconData = categoryIcons[categoryKey];

              // 4. Use the new SwiggyCategoryIcon component for the image display
              if (iconData) {
                return (
                  <SwiggyCategoryIcon
                    key={category.id}
                    category={category}
                    categoryData={iconData}
                    onClick={scrollToCategory}
                  />
                );
              }
              
              // Fallback to original CategoryChip if data structure is unexpectedly missing
              return (
                <CategoryChip
                  key={category.id}
                  name={category.name}
                  icon={categoryIcons[categoryKey]?.fallbackIcon || '🍴'}
                  isActive={activeCategory === category.id}
                  onClick={() => scrollToCategory(category.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-8">
          {categories.map((category) => {
            const items = filterItems(getItemsByCategory(category.id));
            if (items.length === 0) return null;

            return (
              <div
                key={category.id}
                ref={(el) => (categoryRefs.current[category.id] = el)}
              >
                <CategorySection title={category.name}>
                  {items.map(item => (
                    <FoodItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description || ''}
                      price={Number(item.price)}
                      image={item.image_url || getMenuItemImage(item.name) || ''}
                      isWishlisted={wishlistItems.has(item.id)}
                      onAddToCart={() => handleAddToCart(item)}
                      onToggleWishlist={() => handleToggleWishlist(item)}
                    />
                  ))}
                </CategorySection>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Category Button (Adjusted to use the fallback icon string) */}
      <CategoryFloatingButton
        categories={categories.map(cat => {
          const iconData = categoryIcons[cat.name.toLowerCase()];
          return {
            id: cat.id,
            name: cat.name,
            // 5. Pass the simple fallback icon string to CategoryFloatingButton
            icon: iconData?.fallbackIcon || '🍴',
          };
        })}
        onCategoryClick={scrollToCategory}
      />

      <CartSummaryBar />
    </MainLayout>
  );
}