import { useEffect } from 'react';

/**
 * Hook to manage focus for accessibility
 */
export const useFocusManagement = (isOpen: boolean, elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (isOpen && elementRef.current) {
      // Save currently focused element
      const previouslyFocused = document.activeElement as HTMLElement;
      
      // Focus the element
      elementRef.current.focus();

      // Restore focus when closed
      return () => {
        if (previouslyFocused) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isOpen, elementRef]);
};

/**
 * Hook to handle keyboard navigation
 */
export const useKeyboardNavigation = (
  onEscape?: () => void,
  onEnter?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
      if (event.key === 'Enter' && onEnter) {
        onEnter();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
};

/**
 * Hook to announce screen reader messages
 */
export const useAriaLive = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  return { announce };
};
