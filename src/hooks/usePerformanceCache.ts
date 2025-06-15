
import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private stats = { hits: 0, misses: 0 };

  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now();
    
    // Limpar cache se estiver cheio
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp,
      hitCount: 0
    });
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key);
    const currentTtl = ttl || this.defaultTTL;
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > currentTtl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Atualizar hit count
    entry.hitCount++;
    this.stats.hits++;
    
    return entry.data;
  }

  has(key: string, ttl?: number): boolean {
    return this.get(key, ttl) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      entries: this.cache.size
    };
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruHitCount = Infinity;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hitCount < lruHitCount || 
          (entry.hitCount === lruHitCount && entry.timestamp < oldestTimestamp)) {
        lruKey = key;
        lruHitCount = entry.hitCount;
        oldestTimestamp = entry.timestamp;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}

// Instância global do cache
const globalCache = new PerformanceCache();

export function usePerformanceCache() {
  const [stats, setStats] = useState<CacheStats>(globalCache.getStats());

  // Atualizar stats periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalCache.getStats());
    }, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const set = <T>(key: string, data: T, ttl?: number) => {
    globalCache.set(key, data, ttl);
    setStats(globalCache.getStats());
  };

  const get = <T>(key: string, ttl?: number): T | null => {
    const result = globalCache.get<T>(key, ttl);
    setStats(globalCache.getStats());
    return result;
  };

  const has = (key: string, ttl?: number): boolean => {
    return globalCache.has(key, ttl);
  };

  const remove = (key: string): boolean => {
    const result = globalCache.delete(key);
    setStats(globalCache.getStats());
    return result;
  };

  const clear = () => {
    globalCache.clear();
    setStats(globalCache.getStats());
  };

  return {
    set,
    get,
    has,
    remove,
    clear,
    stats
  };
}

// Hook para cache com fetch automatico
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { get, set } = usePerformanceCache();
  const fetchFnRef = useRef(fetchFn);

  // Atualizar função de fetch
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const loadData = async () => {
      // Verificar cache primeiro
      const cachedData = get<T>(key, ttl);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Se não tem cache, buscar dados
      setIsLoading(true);
      setError(null);

      try {
        const freshData = await fetchFnRef.current();
        set(key, freshData, ttl);
        setData(freshData);
      } catch (err) {
        setError(err as Error);
        console.error(`Error fetching cached data for key ${key}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, ttl, ...dependencies]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const freshData = await fetchFnRef.current();
      set(key, freshData, ttl);
      setData(freshData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
}
