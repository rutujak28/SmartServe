import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  Users,
  MessageSquare,
  Brain,
  FileText,
  Settings,
  Shield,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  requiredRoles?: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard, requiredRoles: ['admin'] },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingBag, requiredRoles: ['admin', 'staff'] },
  { title: 'Menu Management', url: '/admin/menu', icon: UtensilsCrossed, requiredRoles: ['admin'] },
  { title: 'Payments', url: '/admin/payments', icon: CreditCard, requiredRoles: ['admin', 'staff'] },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, requiredRoles: ['admin'] },
  { title: 'Users', url: '/admin/users', icon: Users, requiredRoles: ['admin'] },
  { title: 'Feedback', url: '/admin/feedback', icon: MessageSquare, requiredRoles: ['admin'] },
  { title: 'AI Insights', url: '/admin/ai-insights', icon: Brain, requiredRoles: ['admin'] },
  { title: 'Reports', url: '/admin/reports', icon: FileText, requiredRoles: ['admin', 'staff'] },
  { title: 'Audit Logs', url: '/admin/audit-logs', icon: Shield, requiredRoles: ['admin'] },
  { title: 'Settings', url: '/admin/settings', icon: Settings, requiredRoles: ['admin'] },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { hasRole } = useUserRole();

  const isActive = (path: string) => currentPath === path;

  // Filter nav items based on user roles
  const visibleNavItems = navItems.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }
    return hasRole(item.requiredRoles);
  });

  return (
    <Sidebar className={open ? 'w-60' : 'w-14'} collapsible="icon">
      <div className="p-2">
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          active
                            ? 'bg-admin-primary/10 text-admin-primary font-medium'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/kitchen"
                    className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted/50"
                  >
                    <UtensilsCrossed className="h-5 w-5 shrink-0" />
                    {open && <span>Kitchen Display</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
