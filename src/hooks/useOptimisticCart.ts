import { useState, useCallback } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { toast } from 'sonner';

export const useOptimisticCart = () => {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [optimisticItems, setOptimisticItems] = useState<CartItem[]>(items);

  const optimisticAddItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    // Optimistically update UI
    setOptimisticItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Perform actual update
    try {
      addItem(item);
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      // Revert on error
      setOptimisticItems(items);
      toast.error('Failed to add item');
    }
  }, [items, addItem]);

  const optimisticUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    const previousItems = [...optimisticItems];
    
    // Optimistically update UI
    setOptimisticItems(prev =>
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );

    // Perform actual update
    try {
      updateQuantity(itemId, quantity);
    } catch (error) {
      // Revert on error
      setOptimisticItems(previousItems);
      toast.error('Failed to update quantity');
    }
  }, [optimisticItems, updateQuantity]);

  const optimisticRemoveItem = useCallback((itemId: string) => {
    const previousItems = [...optimisticItems];
    
    // Optimistically update UI
    setOptimisticItems(prev => prev.filter(item => item.id !== itemId));

    // Perform actual update
    try {
      removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      // Revert on error
      setOptimisticItems(previousItems);
      toast.error('Failed to remove item');
    }
  }, [optimisticItems, removeItem]);

  return {
    items: optimisticItems,
    addItem: optimisticAddItem,
    updateQuantity: optimisticUpdateQuantity,
    removeItem: optimisticRemoveItem,
  };
};
