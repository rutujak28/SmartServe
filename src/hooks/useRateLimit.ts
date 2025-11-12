import { useRef, useCallback } from 'react';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  onLimitReached?: () => void;
}

/**
 * Hook to implement client-side rate limiting
 */
export const useRateLimit = (options: RateLimitOptions) => {
  const { maxAttempts, windowMs, onLimitReached } = options;
  const attemptsRef = useRef<number[]>([]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove attempts outside the current window
    attemptsRef.current = attemptsRef.current.filter(time => time > windowStart);

    // Check if limit exceeded
    if (attemptsRef.current.length >= maxAttempts) {
      onLimitReached?.();
      return false;
    }

    // Add current attempt
    attemptsRef.current.push(now);
    return true;
  }, [maxAttempts, windowMs, onLimitReached]);

  const reset = useCallback(() => {
    attemptsRef.current = [];
  }, []);

  return { checkRateLimit, reset };
};

/**
 * Hook to implement debouncing
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Hook to implement throttling
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= delay) {
      callback(...args);
      lastRunRef.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRunRef.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]);
};
