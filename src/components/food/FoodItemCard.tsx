import { Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FoodItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isWishlisted?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export const FoodItemCard = ({
  id,
  name,
  description,
  price,
  image,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist,
}: FoodItemCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group border-2 border-transparent hover:border-primary/30" onClick={() => navigate(`/item/${id}`)}>
      <div className="aspect-square relative overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary text-4xl">
            🍽️
          </div>
        )}
        <Button
          size="icon"
          variant="secondary"
          className={cn(
            "absolute top-1.5 right-1.5 rounded-full shadow-lg transition-all duration-300 w-7 h-7",
            isWishlisted 
              ? "bg-secondary text-white hover:bg-secondary/90" 
              : "bg-white/90 hover:bg-white text-secondary hover:text-secondary/80"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
        >
          <Heart className={cn("w-3.5 h-3.5", isWishlisted && "fill-current")} />
        </Button>
      </div>
      <CardContent className="p-2.5">
        <h3 className="font-semibold text-sm mb-0.5 line-clamp-1">{name}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">₹{price}</span>
          <Button 
            size="sm" 
            className="shadow-md hover:shadow-lg transition-all duration-300 h-7 text-xs px-2" 
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
          >
            <Plus className="w-3 h-3 mr-0.5" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
