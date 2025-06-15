
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  priority: number;
  size: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  memoryUsage: number;
  evictions: number;
}

class OptimizedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100;
  private maxMemoryMB = 50;
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private metrics = { hits: 0, misses: 0, evictions: 0 };
  private invalidationRules = new Map<string, RegExp[]>();

  constructor() {
    this.setupInvalidationRules();
    this.startCleanupTimer();
  }

  private setupInvalidationRules() {
    // Regras de invalidação inteligentes
    this.invalidationRules.set('suppliers', [
      /^suppliers-paginated/,
      /^home-suppliers/,
      /^search-/,
      /^admin-suppliers/,
      /^infinite-suppliers/
    ]);
    
    this.invalidationRules.set('categories', [
      /^categories/,
      /^suppliers/,
      /^filters/
    ]);
  }

  private startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Limpeza a cada minuto
  }

  private estimateSize(data: any): number {
    return JSON.stringify(data).length / 1024; // KB aproximado
  }

  private getCurrentMemoryUsage(): number {
    let total = 0;
    this.cache.forEach(entry => {
      total += entry.size;
    });
    return total / 1024; // MB
  }

  set<T>(key: string, data: T, ttl?: number, priority: number = 1): boolean {
    const size = this.estimateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hitCount: 0,
      priority,
      size
    };

    // Verificar limites de memória
    if (this.getCurrentMemoryUsage() + size > this.maxMemoryMB) {
      this.evictByMemory();
    }

    // Verificar limite de entradas
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    return true;
  }

  get<T>(key: string, ttl?: number): T | null {
    const entry = this.cache.get(key);
    const currentTtl = ttl || this.defaultTTL;
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Verificar expiração
    if (Date.now() - entry.timestamp > currentTtl) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Atualizar estatísticas
    entry.hitCount++;
    this.metrics.hits++;
    
    return entry.data;
  }

  invalidate(pattern: string): number {
    const rules = this.invalidationRules.get(pattern) || [new RegExp(pattern)];
    let invalidated = 0;
    
    rules.forEach(regex => {
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          invalidated++;
        }
      }
    });

    console.log(`OptimizedCache: Invalidated ${invalidated} entries for pattern: ${pattern}`);
    return invalidated;
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruScore = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      // Score baseado em idade, hits e prioridade
      const age = Date.now() - entry.timestamp;
      const score = age / ((entry.hitCount + 1) * entry.priority);
      
      if (score < lruScore) {
        lruKey = key;
        lruScore = score;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.metrics.evictions++;
    }
  }

  private evictByMemory(): void {
    // Remover entradas grandes e antigas primeiro
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      const aScore = a[1].size / (a[1].hitCount + 1);
      const bScore = b[1].size / (b[1].hitCount + 1);
      return bScore - aScore;
    });

    // Remover até ficar abaixo do limite
    for (const [key] of entries) {
      if (this.getCurrentMemoryUsage() <= this.maxMemoryMB * 0.8) break;
      this.cache.delete(key);
      this.metrics.evictions++;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.defaultTTL * 2) {
        this.cache.delete(key);
      }
    }
  }

  getMetrics(): CacheMetrics {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      hitRate: total > 0 ? (this.metrics.hits / total) * 100 : 0,
      entries: this.cache.size,
      memoryUsage: this.getCurrentMemoryUsage(),
      evictions: this.metrics.evictions
    };
  }

  clear(): void {
    this.cache.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0 };
  }
}

// Instância global otimizada
const optimizedCache = new OptimizedCache();

export function useOptimizedCache() {
  const [metrics, setMetrics] = useState<CacheMetrics>(optimizedCache.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(optimizedCache.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const set = useCallback(<T>(key: string, data: T, ttl?: number, priority?: number) => {
    return optimizedCache.set(key, data, ttl, priority);
  }, []);

  const get = useCallback(<T>(key: string, ttl?: number): T | null => {
    return optimizedCache.get<T>(key, ttl);
  }, []);

  const invalidate = useCallback((pattern: string) => {
    return optimizedCache.invalidate(pattern);
  }, []);

  const clear = useCallback(() => {
    optimizedCache.clear();
    setMetrics(optimizedCache.getMetrics());
  }, []);

  return {
    set,
    get,
    invalidate,
    clear,
    metrics
  };
}

// Hook para queries com cache otimizado
export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number;
    priority?: number;
    dependencies?: any[];
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { get, set } = useOptimizedCache();
  const queryFnRef = useRef(queryFn);
  const optionsRef = useRef(options);

  useEffect(() => {
    queryFnRef.current = queryFn;
    optionsRef.current = options;
  }, [queryFn, options]);

  useEffect(() => {
    if (options.enabled === false) return;

    const loadData = async () => {
      // Verificar cache primeiro
      const cachedData = get<T>(key, options.ttl);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const startTime = performance.now();
        const freshData = await queryFnRef.current();
        const duration = performance.now() - startTime;
        
        // Log queries lentas
        if (duration > 1000) {
          console.warn(`Slow query detected: ${key} took ${duration.toFixed(2)}ms`);
        }
        
        set(key, freshData, options.ttl, options.priority);
        setData(freshData);
      } catch (err) {
        setError(err as Error);
        console.error(`Error in optimized query ${key}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, options.ttl, options.priority, options.enabled, ...(options.dependencies || [])]);

  return {
    data,
    isLoading,
    error
  };
}
