
import { useEffect, useState } from 'react';

interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

interface WebVitalsThresholds {
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  fcp: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
}

const THRESHOLDS: WebVitalsThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 }
};

export function useWebVitals() {
  const [metrics, setMetrics] = useState<Partial<WebVitalsMetrics>>({});
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar se Web Vitals API está disponível
    if ('performance' in window && 'PerformanceObserver' in window) {
      setIsSupported(true);
      initializeWebVitals();
    }
  }, []);

  const initializeWebVitals = () => {
    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }

    // FCP - First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      });
    });

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP observation not supported');
    }

    // TTFB - Time to First Byte
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      const ttfb = nav.responseStart - nav.requestStart;
      setMetrics(prev => ({ ...prev, ttfb }));
    }
  };

  const getMetricStatus = (metricName: keyof WebVitalsMetrics, value: number) => {
    const threshold = THRESHOLDS[metricName];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  const getOverallScore = () => {
    const scores = Object.entries(metrics).map(([key, value]) => {
      if (value === undefined) return null;
      const status = getMetricStatus(key as keyof WebVitalsMetrics, value);
      return status === 'good' ? 3 : status === 'needs-improvement' ? 2 : 1;
    }).filter(Boolean);

    if (scores.length === 0) return 'unknown';
    
    const avgScore = scores.reduce((a, b) => a! + b!, 0)! / scores.length;
    if (avgScore >= 2.5) return 'good';
    if (avgScore >= 1.5) return 'needs-improvement';
    return 'poor';
  };

  return {
    metrics,
    isSupported,
    getMetricStatus,
    getOverallScore,
    thresholds: THRESHOLDS
  };
}
