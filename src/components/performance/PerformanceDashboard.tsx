import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import { useWebVitals } from '@/hooks/useWebVitals';
import { Activity, BarChart, Gauge, Monitor, Zap, Globe } from 'lucide-react';

export function PerformanceDashboard() {
  const { metrics, getSlowQueries, clear: clearMetrics } = usePerformanceMonitor();
  const { stats, clear: clearCache } = useAdvancedCache();
  const { metrics: webVitals, getMetricStatus, getOverallScore } = useWebVitals();

  const slowQueries = getSlowQueries(5);

  const formatDuration = (duration: number) => {
    return `${duration.toFixed(0)}ms`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getWebVitalColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor cache performance, query metrics, and Core Web Vitals in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearCache}>
            Clear Cache
          </Button>
          <Button variant="outline" size="sm" onClick={clearMetrics}>
            Clear Metrics
          </Button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOverallScore().toUpperCase()}</div>
            <Badge className={getWebVitalColor(getOverallScore())} variant="secondary">
              Core Web Vitals
            </Badge>
          </CardContent>
        </Card>

        {webVitals.lcp && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LCP</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(webVitals.lcp)}</div>
              <Badge className={getWebVitalColor(getMetricStatus('lcp', webVitals.lcp))} variant="secondary">
                Largest Contentful Paint
              </Badge>
            </CardContent>
          </Card>
        )}

        {webVitals.fid && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FID</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(webVitals.fid)}</div>
              <Badge className={getWebVitalColor(getMetricStatus('fid', webVitals.fid))} variant="secondary">
                First Input Delay
              </Badge>
            </CardContent>
          </Card>
        )}

        {webVitals.cls !== undefined && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CLS</CardTitle>
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webVitals.cls.toFixed(3)}</div>
              <Badge className={getWebVitalColor(getMetricStatus('cls', webVitals.cls))} variant="secondary">
                Cumulative Layout Shift
              </Badge>
            </CardContent>
          </Card>
        )}

        {webVitals.fcp && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FCP</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(webVitals.fcp)}</div>
              <Badge className={getWebVitalColor(getMetricStatus('fcp', webVitals.fcp))} variant="secondary">
                First Contentful Paint
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.responseTime)}</div>
            <Badge 
              className={getPerformanceColor(metrics.responseTime, { good: 200, warning: 500 })}
              variant="secondary"
            >
              {metrics.responseTime <= 200 ? 'Excellent' : metrics.responseTime <= 500 ? 'Good' : 'Slow'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advanced Cache Hit Rate</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">
              L2 Hits: {stats.l2Hits}
            </div>
            <Badge 
              className={getPerformanceColor(100 - stats.hitRate, { good: 10, warning: 30 })}
              variant="secondary"
            >
              {stats.hitRate >= 90 ? 'Excellent' : stats.hitRate >= 70 ? 'Good' : 'Poor'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatDuration(metrics.averageResponseTime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memoryUsage}</div>
            <p className="text-xs text-muted-foreground">
              Cache entries
            </p>
            <Badge 
              className={getPerformanceColor(stats.memoryUsage, { good: 100, warning: 200 })}
              variant="secondary"
            >
              {stats.memoryUsage <= 100 ? 'Optimal' : stats.memoryUsage <= 200 ? 'Good' : 'High'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Cache Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Cache Performance</CardTitle>
            <CardDescription>L1/L2 cache metrics with intelligent eviction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Cache Entries</span>
              <Badge variant="outline">{stats.entries}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">L1 + L2 Hits</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {stats.hits}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">L2 Specific Hits</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {stats.l2Hits}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Hit Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(stats.hitRate, 100)}%` }}
                  />
                </div>
                <span className="text-sm">{stats.hitRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>AI-powered recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.hitRate < 70 && (
                <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                  <Monitor className="h-4 w-4" />
                  <span className="text-sm">Low cache hit rate. Consider increasing cache priority for frequent queries.</span>
                </div>
              )}
              {metrics.averageResponseTime > 500 && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">High response time. Check database indexes and query optimization.</span>
                </div>
              )}
              {webVitals.lcp && webVitals.lcp > 2500 && (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">LCP needs improvement. Consider image optimization and lazy loading.</span>
                </div>
              )}
              {stats.hitRate >= 90 && metrics.averageResponseTime <= 300 && getOverallScore() === 'good' && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm">🚀 Exceptional performance! All metrics are optimal.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slow Queries Table */}
      {slowQueries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slow Queries</CardTitle>
            <CardDescription>Queries taking longer than 1 second</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slowQueries.map((query, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{query.key}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(query.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {formatDuration(query.duration)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
