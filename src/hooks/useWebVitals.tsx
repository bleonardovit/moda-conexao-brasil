
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to report metrics
    const reportMetric = (metric: WebVitalMetric) => {
      logger.info(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        url: window.location.pathname
      });

      // In production, send to analytics service
      if (process.env.NODE_ENV === 'production') {
        // Send to your analytics service
        // analytics.track('web-vital', metric);
      }
    };

    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportMetric);
      getFID(reportMetric);
      getFCP(reportMetric);
      getLCP(reportMetric);
      getTTFB(reportMetric);
    }).catch(() => {
      // Silently fail if web-vitals is not available
    });
  }, []);
}
