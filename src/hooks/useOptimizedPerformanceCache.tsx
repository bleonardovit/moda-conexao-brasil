
import { useCallback, useMemo, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useOptimizedPerformanceCache<T>() {
  const cache = useRef(new Map<string, CacheEntry<T>>());

  const set = useCallback((key: string, data: T, ttl: number = 5 * 60 * 1000) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const clear = useCallback((pattern?: string) => {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of cache.current.keys()) {
        if (regex.test(key)) {
          cache.current.delete(key);
        }
      }
    } else {
      cache.current.clear();
    }
  }, []);

  const size = useMemo(() => cache.current.size, []);

  return { set, get, clear, size };
}
