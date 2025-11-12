import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: string;
  bgColor?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'text-admin-primary',
  bgColor = 'bg-admin-primary/10',
}: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIndicator value={trend} />
            {trendLabel && (
              <p className="text-xs text-muted-foreground">{trendLabel}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
