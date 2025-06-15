
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { usePerformanceCache } from '@/hooks/usePerformanceCache';
import { Activity, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PerformanceIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics } = usePerformanceMonitor();
  const { stats } = usePerformanceCache();

  const getStatusColor = () => {
    if (stats.hitRate >= 85 && metrics.responseTime <= 300) return 'bg-green-500';
    if (stats.hitRate >= 60 && metrics.responseTime <= 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="shadow-lg border-2">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Performance</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </Button>
          </div>
          
          {isExpanded && (
            <div className="mt-3 space-y-2 min-w-[200px]">
              <div className="flex justify-between text-xs">
                <span>Response Time:</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.responseTime.toFixed(0)}ms
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cache Hit Rate:</span>
                <Badge variant="outline" className="text-xs">
                  {stats.hitRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Total Queries:</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.totalQueries}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cache Entries:</span>
                <Badge variant="outline" className="text-xs">
                  {stats.entries}
                </Badge>
              </div>
              <Link to="/performance">
                <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs">
                  View Dashboard
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
