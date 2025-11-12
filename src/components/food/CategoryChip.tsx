import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CategoryChipProps {
  name: string;
  icon: string;
  isActive?: boolean;
  onClick: () => void;
}

export const CategoryChip = ({ name, icon, isActive, onClick }: CategoryChipProps) => {
  return (
    <Card
      className={cn(
        "flex-shrink-0 w-28 h-32 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
        isActive ? "ring-2 ring-primary shadow-lg bg-gradient-fresh" : "hover:border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full p-3">
        <div className={cn(
          "text-4xl mb-2 transition-transform duration-300",
          isActive ? "scale-110" : ""
        )}>
          {icon}
        </div>
        <p className={cn(
          "text-xs font-medium text-center line-clamp-2",
          isActive ? "text-white font-semibold" : "text-foreground"
        )}>
          {name}
        </p>
      </div>
    </Card>
  );
};
