import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Samosa inventory running low (5 remaining)',
    time: '5 mins ago',
  },
  {
    id: '2',
    type: 'success',
    title: 'Order Completed',
    message: 'Order #ORD-045 has been served',
    time: '10 mins ago',
  },
  {
    id: '3',
    type: 'info',
    title: 'New Order',
    message: 'New order #ORD-046 from Table 12',
    time: '15 mins ago',
  },
];

export function NotificationPanel() {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-admin-warning" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-admin-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-admin-destructive" />;
      default:
        return <Info className="h-4 w-4 text-admin-primary" />;
    }
  };

  const getBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'outline';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <Badge variant="secondary">{mockNotifications.length} new</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <Badge variant={getBadgeVariant(notification.type)} className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
