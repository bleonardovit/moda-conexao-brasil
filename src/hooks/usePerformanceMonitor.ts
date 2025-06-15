
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  totalQueries: number;
  averageResponseTime: number;
  slowQueries: number;
}

interface QueryMetric {
  key: string;
  duration: number;
  timestamp: number;
  cached: boolean;
}

class PerformanceMonitor {
  private metrics: QueryMetric[] = [];
  private readonly maxMetrics = 1000;
  private readonly slowQueryThreshold = 1000; // 1 second

  recordQuery(key: string, duration: number, cached: boolean = false): void {
    const metric: QueryMetric = {
      key,
      duration,
      timestamp: Date.now(),
      cached
    };

    this.metrics.push(metric);

    // Manter apenas as últimas métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log queries lentas
    if (duration > this.slowQueryThreshold) {
      console.warn(`Slow query detected: ${key} took ${duration}ms`);
    }
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        responseTime: 0,
        cacheHitRate: 0,
        totalQueries: 0,
        averageResponseTime: 0,
        slowQueries: 0
      };
    }

    const totalQueries = this.metrics.length;
    const cachedQueries = this.metrics.filter(m => m.cached).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const slowQueries = this.metrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const recentMetrics = this.metrics.slice(-10);
    const recentDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      responseTime: recentMetrics.length > 0 ? recentDuration / recentMetrics.length : 0,
      cacheHitRate: (cachedQueries / totalQueries) * 100,
      totalQueries,
      averageResponseTime: totalDuration / totalQueries,
      slowQueries
    };
  }

  getSlowQueries(limit: number = 10): QueryMetric[] {
    return this.metrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  clear(): void {
    this.metrics = [];
  }
}

// Instância global do monitor
const globalMonitor = new PerformanceMonitor();

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(globalMonitor.getMetrics());

  // Atualizar métricas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalMonitor.getMetrics());
    }, 5000); // A cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const recordQuery = (key: string, duration: number, cached: boolean = false) => {
    globalMonitor.recordQuery(key, duration, cached);
    setMetrics(globalMonitor.getMetrics());
  };

  const getSlowQueries = (limit?: number) => {
    return globalMonitor.getSlowQueries(limit);
  };

  const clear = () => {
    globalMonitor.clear();
    setMetrics(globalMonitor.getMetrics());
  };

  return {
    metrics,
    recordQuery,
    getSlowQueries,
    clear
  };
}

// Hook para monitorar queries automaticamente
export function useQueryMonitor<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { recordQuery } = usePerformanceMonitor();
  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  useEffect(() => {
    const executeQuery = async () => {
      setIsLoading(true);
      setError(null);
      
      const startTime = performance.now();

      try {
        const result = await queryFnRef.current();
        const duration = performance.now() - startTime;
        
        recordQuery(queryKey, duration, false);
        setData(result);
      } catch (err) {
        const duration = performance.now() - startTime;
        recordQuery(queryKey, duration, false);
        setError(err as Error);
        console.error(`Query ${queryKey} failed:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    executeQuery();
  }, [queryKey, ...dependencies]);

  return {
    data,
    isLoading,
    error
  };
}
