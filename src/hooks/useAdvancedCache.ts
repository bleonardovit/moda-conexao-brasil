
import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hitCount: number;
  priority: number;
  compressed?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  memoryUsage: number;
  l2Hits: number;
}

class AdvancedCache {
  private l1Cache = new Map<string, CacheEntry<any>>();
  private l2Cache = new Map<string, CacheEntry<any>>();
  private maxL1Size = 50; // Cache L1 menor e mais rápido
  private maxL2Size = 200; // Cache L2 maior para dados menos acessados
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private l2TTL = 15 * 60 * 1000; // 15 minutos para L2
  private stats = { hits: 0, misses: 0, l2Hits: 0 };
  private invalidationPatterns = new Map<string, RegExp[]>();

  // Configurar padrões de invalidação
  constructor() {
    this.setupInvalidationPatterns();
  }

  private setupInvalidationPatterns() {
    // Quando suppliers mudam, invalidar caches relacionados
    this.invalidationPatterns.set('suppliers', [
      /^suppliers/,
      /^home-suppliers/,
      /^supplier-navigation/,
      /^infinite-suppliers/
    ]);

    // Quando categories mudam, invalidar caches relacionados
    this.invalidationPatterns.set('categories', [
      /^categories/,
      /^suppliers/,
      /^home-suppliers/
    ]);
  }

  set<T>(key: string, data: T, ttl?: number, priority: number = 1): void {
    const timestamp = Date.now();
    const entry: CacheEntry<T> = {
      data: this.compressData(data),
      timestamp,
      hitCount: 0,
      priority,
      compressed: this.shouldCompress(data)
    };

    // Sempre tentar L1 primeiro
    if (this.l1Cache.size >= this.maxL1Size) {
      this.evictL1();
    }

    this.l1Cache.set(key, entry);
    
    // Para dados com prioridade alta, também colocar em L2
    if (priority > 2) {
      if (this.l2Cache.size >= this.maxL2Size) {
        this.evictL2();
      }
      this.l2Cache.set(key, { ...entry });
    }
  }

  get<T>(key: string, ttl?: number): T | null {
    const currentTtl = ttl || this.defaultTTL;
    
    // Tentar L1 primeiro
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && Date.now() - l1Entry.timestamp <= currentTtl) {
      l1Entry.hitCount++;
      this.stats.hits++;
      return this.decompressData(l1Entry.data);
    }

    // Se não encontrou em L1, tentar L2
    const l2Entry = this.l2Cache.get(key);
    if (l2Entry && Date.now() - l2Entry.timestamp <= this.l2TTL) {
      l2Entry.hitCount++;
      this.stats.l2Hits++;
      this.stats.hits++;
      
      // Promover para L1 se tem espaço
      if (this.l1Cache.size < this.maxL1Size) {
        this.l1Cache.set(key, { ...l2Entry, timestamp: Date.now() });
      }
      
      return this.decompressData(l2Entry.data);
    }

    // Limpar entradas expiradas
    if (l1Entry) this.l1Cache.delete(key);
    if (l2Entry) this.l2Cache.delete(key);
    
    this.stats.misses++;
    return null;
  }

  invalidate(pattern: string): void {
    const patterns = this.invalidationPatterns.get(pattern) || [new RegExp(pattern)];
    
    patterns.forEach(regex => {
      // Invalidar em L1
      for (const key of this.l1Cache.keys()) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          console.log(`AdvancedCache: Invalidated L1 key ${key}`);
        }
      }
      
      // Invalidar em L2
      for (const key of this.l2Cache.keys()) {
        if (regex.test(key)) {
          this.l2Cache.delete(key);
          console.log(`AdvancedCache: Invalidated L2 key ${key}`);
        }
      }
    });
  }

  private shouldCompress(data: any): boolean {
    // Comprimir se dados > 1KB
    return JSON.stringify(data).length > 1024;
  }

  private compressData(data: any): any {
    if (this.shouldCompress(data)) {
      // Simulação de compressão (em produção, usar uma lib real)
      return { _compressed: true, data: JSON.stringify(data) };
    }
    return data;
  }

  private decompressData(data: any): any {
    if (data && data._compressed) {
      return JSON.parse(data.data);
    }
    return data;
  }

  private evictL1(): void {
    let lruKey = '';
    let lruScore = Infinity;

    for (const [key, entry] of this.l1Cache.entries()) {
      // Score baseado em hitCount e prioridade (menor score = mais candidato para remoção)
      const score = (entry.hitCount + 1) * entry.priority;
      if (score < lruScore) {
        lruKey = key;
        lruScore = score;
      }
    }

    if (lruKey) {
      const entry = this.l1Cache.get(lruKey);
      this.l1Cache.delete(lruKey);
      
      // Mover para L2 se tem valor
      if (entry && entry.hitCount > 0) {
        this.l2Cache.set(lruKey, entry);
      }
    }
  }

  private evictL2(): void {
    let lruKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.l2Cache.entries()) {
      if (entry.timestamp < oldestTime) {
        lruKey = key;
        oldestTime = entry.timestamp;
      }
    }

    if (lruKey) {
      this.l2Cache.delete(lruKey);
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const memoryUsage = this.l1Cache.size + this.l2Cache.size;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      entries: memoryUsage,
      memoryUsage,
      l2Hits: this.stats.l2Hits
    };
  }

  clear(): void {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.stats = { hits: 0, misses: 0, l2Hits: 0 };
  }
}

// Instância global do cache avançado
const globalAdvancedCache = new AdvancedCache();

export function useAdvancedCache() {
  const [stats, setStats] = useState<CacheStats>(globalAdvancedCache.getStats());

  // Atualizar stats periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalAdvancedCache.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const set = useCallback(<T>(key: string, data: T, ttl?: number, priority?: number) => {
    globalAdvancedCache.set(key, data, ttl, priority);
    setStats(globalAdvancedCache.getStats());
  }, []);

  const get = useCallback(<T>(key: string, ttl?: number): T | null => {
    const result = globalAdvancedCache.get<T>(key, ttl);
    setStats(globalAdvancedCache.getStats());
    return result;
  }, []);

  const invalidate = useCallback((pattern: string) => {
    globalAdvancedCache.invalidate(pattern);
    setStats(globalAdvancedCache.getStats());
  }, []);

  const clear = useCallback(() => {
    globalAdvancedCache.clear();
    setStats(globalAdvancedCache.getStats());
  }, []);

  return {
    set,
    get,
    invalidate,
    clear,
    stats
  };
}

// Hook para dados com cache automático e prefetch
export function useAdvancedCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    priority?: number;
    dependencies?: any[];
    prefetchNext?: () => Promise<T>;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { get, set } = useAdvancedCache();
  const fetchFnRef = useRef(fetchFn);
  const prefetchRef = useRef(options.prefetchNext);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    prefetchRef.current = options.prefetchNext;
  }, [fetchFn, options.prefetchNext]);

  useEffect(() => {
    const loadData = async () => {
      // Verificar cache primeiro
      const cachedData = get<T>(key, options.ttl);
      if (cachedData) {
        setData(cachedData);
        
        // Prefetch próximos dados em background
        if (prefetchRef.current) {
          setTimeout(() => {
            prefetchRef.current?.();
          }, 100);
        }
        
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const freshData = await fetchFnRef.current();
        set(key, freshData, options.ttl, options.priority);
        setData(freshData);
        
        // Prefetch próximos dados
        if (prefetchRef.current) {
          setTimeout(() => {
            prefetchRef.current?.();
          }, 100);
        }
      } catch (err) {
        setError(err as Error);
        console.error(`Error fetching advanced cached data for key ${key}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, options.ttl, options.priority, ...(options.dependencies || [])]);

  return {
    data,
    isLoading,
    error
  };
}
