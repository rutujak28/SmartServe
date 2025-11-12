import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/NotificationBell';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';

export const AdminHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { roles } = useUserRole();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data?.full_name) {
        setUserName(data.full_name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayRole = roles.includes('admin') ? 'Admin' : roles[0] || 'User';
  const displayName = userName || user?.email || 'Admin';

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-admin-primary">SmartServe Admin</h1>
          <Badge variant="secondary" className="capitalize">{displayRole}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-admin-primary text-white text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{displayName}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
