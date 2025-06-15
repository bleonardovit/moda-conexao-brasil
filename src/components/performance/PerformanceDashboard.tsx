
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { usePerformanceCache } from '@/hooks/usePerformanceCache';
import { Activity, BarChart, Gauge, Monitor } from 'lucide-react';

export function PerformanceDashboard() {
  const { metrics, getSlowQueries, clear: clearMetrics } = usePerformanceMonitor();
  const { stats, clear: clearCache } = usePerformanceCache();

  const slowQueries = getSlowQueries(5);

  const formatDuration = (duration: number) => {
    return `${duration.toFixed(0)}ms`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100 text-green-800';
    if (value <= thresholds.warning) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor cache performance and query metrics in real-time
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
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hitRate.toFixed(1)}%</div>
            <Badge 
              className={getPerformanceColor(100 - stats.hitRate, { good: 15, warning: 40 })}
              variant="secondary"
            >
              {stats.hitRate >= 85 ? 'Excellent' : stats.hitRate >= 60 ? 'Good' : 'Poor'}
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
            <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.slowQueries}</div>
            <Badge 
              className={getPerformanceColor(metrics.slowQueries, { good: 0, warning: 3 })}
              variant="secondary"
            >
              {metrics.slowQueries === 0 ? 'Perfect' : metrics.slowQueries <= 3 ? 'Good' : 'Concerning'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Cache Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache Statistics</CardTitle>
            <CardDescription>Current cache performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Entries</span>
              <Badge variant="outline">{stats.entries}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Hits</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {stats.hits}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cache Misses</span>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {stats.misses}
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
            <CardTitle>Query Performance</CardTitle>
            <CardDescription>Recent query execution metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Average Response</span>
              <Badge variant="outline">{formatDuration(metrics.averageResponseTime)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recent Response</span>
              <Badge 
                variant="outline"
                className={getPerformanceColor(metrics.responseTime, { good: 200, warning: 500 })}
              >
                {formatDuration(metrics.responseTime)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Queries</span>
              <Badge variant="outline">{metrics.totalQueries}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Slow Queries</span>
              <Badge 
                variant="outline"
                className={metrics.slowQueries > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}
              >
                {metrics.slowQueries}
              </Badge>
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

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Recommendations based on current metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.hitRate < 60 && (
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                <Monitor className="h-4 w-4" />
                <span className="text-sm">Low cache hit rate. Consider increasing cache TTL.</span>
              </div>
            )}
            {metrics.averageResponseTime > 500 && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded">
                <Activity className="h-4 w-4" />
                <span className="text-sm">High average response time. Check query optimization.</span>
              </div>
            )}
            {metrics.slowQueries > 5 && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-2 rounded">
                <BarChart className="h-4 w-4" />
                <span className="text-sm">Multiple slow queries detected. Review database indexes.</span>
              </div>
            )}
            {stats.hitRate >= 85 && metrics.averageResponseTime <= 300 && metrics.slowQueries === 0 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
                <Gauge className="h-4 w-4" />
                <span className="text-sm">Excellent performance! All metrics are optimal.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
