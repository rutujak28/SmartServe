import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  showValue?: boolean;
}

export function TrendIndicator({ value, showValue = true }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const color = isNeutral 
    ? 'text-muted-foreground' 
    : isPositive 
    ? 'text-admin-success' 
    : 'text-admin-destructive';
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {showValue && <span>{Math.abs(value)}%</span>}
    </div>
  );
}
