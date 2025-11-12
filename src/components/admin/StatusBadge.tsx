import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    className: 'bg-admin-warning/20 text-admin-warning border-admin-warning/30',
  },
  preparing: {
    label: 'Preparing',
    variant: 'default',
    className: 'bg-admin-primary/20 text-admin-primary border-admin-primary/30',
  },
  ready: {
    label: 'Ready',
    variant: 'default',
    className: 'bg-admin-success/20 text-admin-success border-admin-success/30',
  },
  served: {
    label: 'Served',
    variant: 'outline',
    className: 'bg-admin-secondary/20 text-admin-secondary border-admin-secondary/30',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    className: 'bg-admin-destructive/20 text-admin-destructive border-admin-destructive/30',
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};
