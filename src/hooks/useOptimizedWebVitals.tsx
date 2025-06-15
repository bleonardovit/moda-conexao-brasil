
import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

export function useOptimizedWebVitals() {
  const metricsRef = useRef<Map<string, WebVitalMetric>>(new Map());
  const reportedRef = useRef<Set<string>>(new Set());

  const reportMetric = useCallback((metric: WebVitalMetric) => {
    // Avoid duplicate reports
    if (reportedRef.current.has(metric.name)) {
      return;
    }

    metricsRef.current.set(metric.name, metric);
    reportedRef.current.add(metric.name);

    logger.info(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      url: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      // analytics.track('web-vital', metric);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | undefined;

    // Dynamically import web-vitals with correct API
    import('web-vitals')
      .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        try {
          onCLS(reportMetric);
          onINP(reportMetric); // Updated from onFID to onINP
          onFCP(reportMetric);
          onLCP(reportMetric);
          onTTFB(reportMetric);
        } catch (error) {
          console.warn('Error setting up web vitals:', error);
        }
      })
      .catch((error) => {
        console.warn('Failed to load web-vitals library:', error);
      });

    return cleanup;
  }, [reportMetric]);

  const getMetrics = useCallback(() => {
    return Array.from(metricsRef.current.values());
  }, []);

  const getMetric = useCallback((name: string) => {
    return metricsRef.current.get(name);
  }, []);

  return { getMetrics, getMetric };
}
