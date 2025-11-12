import { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFloatingButtonProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryFloatingButton = ({ categories, onCategoryClick }: CategoryFloatingButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        size="lg"
        className={cn(
          "fixed bottom-24 left-6 z-50 rounded-full w-14 h-14 shadow-2xl transition-all duration-300",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-40 left-6 z-40 p-4 max-h-96 overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-2 min-w-[200px]">
            <p className="text-sm font-semibold mb-3 text-muted-foreground">Jump to Category</p>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className="w-full justify-start hover:bg-accent/50 transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                <span className="mr-2 text-xl">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </>
  );
};
