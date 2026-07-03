// Cached state hook for performance
import { useState, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useCachedState<T>(
  key: string,
  initialValue: T,
  ttlMs: number = 5 * 60 * 1000
) {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [state, setState] = useState<T>(() => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data;
    }
    return initialValue;
  });

  const setCachedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState(prev => {
        const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        cacheRef.current.set(key, { data: newValue, timestamp: Date.now() });
        return newValue;
      });
    },
    [key]
  );

  const invalidateCache = useCallback(() => {
    cacheRef.current.delete(key);
  }, [key]);

  return [state, setCachedState, invalidateCache] as const;
}

export default useCachedState;
