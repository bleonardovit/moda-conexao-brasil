
import { useState, useEffect, useCallback } from 'react';

interface QueryMetric {
  key: string;
  duration: number;
  timestamp: number;
  cached: boolean;
  error?: string;
  retries: number;
}

interface PerformanceMetrics {
  totalQueries: number;
  averageResponseTime: number;
  slowQueries: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
  activeConnections: number;
}

interface DatabaseHealthMetrics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queryPerformance: {
    avgQueryTime: number;
    slowQueryCount: number;
    errorCount: number;
  };
  memoryUsage: {
    cacheSize: number;
    totalMemory: number;
    freeMemory: number;
  };
}

class UnifiedPerformanceMonitor {
  private metrics: QueryMetric[] = [];
  private readonly maxMetrics = 1000;
  private readonly slowQueryThreshold = 1000; // 1 segundo
  private readonly criticalSlowThreshold = 3000; // 3 segundos
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthMetrics: DatabaseHealthMetrics = {
    connectionPool: { active: 0, idle: 0, total: 0 },
    queryPerformance: { avgQueryTime: 0, slowQueryCount: 0, errorCount: 0 },
    memoryUsage: { cacheSize: 0, totalMemory: 0, freeMemory: 0 }
  };

  constructor() {
    this.startHealthMonitoring();
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.updateHealthMetrics();
      this.cleanupOldMetrics();
    }, 30000); // A cada 30 segundos
  }

  private updateHealthMetrics() {
    const recentMetrics = this.metrics.slice(-100); // Últimas 100 queries
    
    if (recentMetrics.length > 0) {
      const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
      const errorCount = recentMetrics.filter(m => m.error).length;
      const slowCount = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length;

      this.healthMetrics.queryPerformance = {
        avgQueryTime: totalDuration / recentMetrics.length,
        slowQueryCount: slowCount,
        errorCount: errorCount
      };
    }

    // Simular métricas de memória (em produção, isso viria do backend)
    this.healthMetrics.memoryUsage = {
      cacheSize: this.metrics.length * 0.1, // KB aproximado
      totalMemory: 512 * 1024, // 512MB
      freeMemory: 256 * 1024   // 256MB
    };
  }

  private cleanupOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  recordQuery(
    key: string, 
    duration: number, 
    cached: boolean = false, 
    error?: string,
    retries: number = 0
  ): void {
    const metric: QueryMetric = {
      key,
      duration,
      timestamp: Date.now(),
      cached,
      error,
      retries
    };

    this.metrics.push(metric);

    // Manter apenas as últimas métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log queries críticas
    if (duration > this.criticalSlowThreshold) {
      console.error(`🚨 CRITICAL SLOW QUERY: ${key} took ${duration}ms`);
    } else if (duration > this.slowQueryThreshold) {
      console.warn(`⚠️ Slow query: ${key} took ${duration}ms`);
    }

    // Log erros
    if (error) {
      console.error(`❌ Query error in ${key}:`, error);
    }

    // Log retries
    if (retries > 0) {
      console.warn(`🔄 Query ${key} retried ${retries} times`);
    }
  }

  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        slowQueries: 0,
        errorRate: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        activeConnections: 0
      };
    }

    const totalQueries = this.metrics.length;
    const cachedQueries = this.metrics.filter(m => m.cached).length;
    const errorQueries = this.metrics.filter(m => m.error).length;
    const slowQueries = this.metrics.filter(m => m.duration > this.slowQueryThreshold).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      totalQueries,
      averageResponseTime: totalDuration / totalQueries,
      slowQueries,
      errorRate: (errorQueries / totalQueries) * 100,
      cacheHitRate: (cachedQueries / totalQueries) * 100,
      memoryUsage: this.healthMetrics.memoryUsage.cacheSize,
      activeConnections: this.healthMetrics.connectionPool.active
    };
  }

  getHealthMetrics(): DatabaseHealthMetrics {
    return { ...this.healthMetrics };
  }

  getSlowQueries(limit: number = 10): QueryMetric[] {
    return this.metrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getErrorQueries(limit: number = 10): QueryMetric[] {
    return this.metrics
      .filter(m => m.error)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getTopQueries(limit: number = 10): { key: string; count: number; avgDuration: number }[] {
    const queryStats = new Map<string, { count: number; totalDuration: number }>();
    
    this.metrics.forEach(m => {
      const stats = queryStats.get(m.key) || { count: 0, totalDuration: 0 };
      stats.count++;
      stats.totalDuration += m.duration;
      queryStats.set(m.key, stats);
    });

    return Array.from(queryStats.entries())
      .map(([key, stats]) => ({
        key,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clear(): void {
    this.metrics = [];
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Instância global do monitor
const globalPerformanceMonitor = new UnifiedPerformanceMonitor();

export function useUnifiedPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(globalPerformanceMonitor.getMetrics());
  const [healthMetrics, setHealthMetrics] = useState<DatabaseHealthMetrics>(globalPerformanceMonitor.getHealthMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(globalPerformanceMonitor.getMetrics());
      setHealthMetrics(globalPerformanceMonitor.getHealthMetrics());
    }, 5000); // A cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const recordQuery = useCallback((
    key: string, 
    duration: number, 
    cached: boolean = false, 
    error?: string,
    retries: number = 0
  ) => {
    globalPerformanceMonitor.recordQuery(key, duration, cached, error, retries);
    setMetrics(globalPerformanceMonitor.getMetrics());
  }, []);

  const getSlowQueries = useCallback((limit?: number) => {
    return globalPerformanceMonitor.getSlowQueries(limit);
  }, []);

  const getErrorQueries = useCallback((limit?: number) => {
    return globalPerformanceMonitor.getErrorQueries(limit);
  }, []);

  const getTopQueries = useCallback((limit?: number) => {
    return globalPerformanceMonitor.getTopQueries(limit);
  }, []);

  const clear = useCallback(() => {
    globalPerformanceMonitor.clear();
    setMetrics(globalPerformanceMonitor.getMetrics());
    setHealthMetrics(globalPerformanceMonitor.getHealthMetrics());
  }, []);

  return {
    metrics,
    healthMetrics,
    recordQuery,
    getSlowQueries,
    getErrorQueries,
    getTopQueries,
    clear
  };
}

// Hook para monitoramento automático de queries
export function usePerformanceMonitoredQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { recordQuery } = useUnifiedPerformanceMonitor();

  useEffect(() => {
    const executeQuery = async () => {
      setIsLoading(true);
      setError(null);
      
      const startTime = performance.now();
      let retries = 0;
      const maxRetries = 3;

      const attemptQuery = async (): Promise<T> => {
        try {
          return await queryFn();
        } catch (err) {
          retries++;
          if (retries < maxRetries && !(err as Error).message.includes('uuid')) {
            console.warn(`Retrying query ${queryKey}, attempt ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            return attemptQuery();
          }
          throw err;
        }
      };

      try {
        const result = await attemptQuery();
        const duration = performance.now() - startTime;
        
        recordQuery(queryKey, duration, false, undefined, retries);
        setData(result);
      } catch (err) {
        const duration = performance.now() - startTime;
        const errorMessage = (err as Error).message;
        
        recordQuery(queryKey, duration, false, errorMessage, retries);
        setError(err as Error);
        console.error(`Query ${queryKey} failed after ${retries} retries:`, err);
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
