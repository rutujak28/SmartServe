import { Search, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { NotificationBell } from '@/components/NotificationBell';

interface HeaderProps {
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
}

export const Header = ({ showSearch = false, onSearchChange, searchValue }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-gradient-brand border-b shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/home" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">SmartServe</h1>
          </Link>
          
          {showSearch && (
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for food..."
                className="pl-10"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-white hover:bg-white/20"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon" aria-label="Profile" className="text-white hover:bg-white/20">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
