import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
}

export const QuantitySelector = ({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
}: QuantitySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onDecrease}
        disabled={quantity <= min}
        className="h-8 w-8 border-primary/50 hover:bg-primary/10 text-primary hover:text-primary"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="font-semibold min-w-[2rem] text-center text-foreground">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={onIncrease}
        disabled={quantity >= max}
        className="h-8 w-8 border-accent/50 hover:bg-accent/10 text-accent hover:text-accent"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};
