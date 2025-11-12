import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Heart, FileText } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { icon: Home, label: 'Menu', path: '/home' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: totalItems },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: FileText, label: 'Orders', path: '/orders' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {badge && badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
