
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export const SupplierSkeleton = memo(function SupplierSkeleton() {
  const isMobile = useIsMobile();

  return (
    <Card className="overflow-hidden card-hover">
      <div className={isMobile ? "flex flex-col" : "sm:flex"}>
        <div className={isMobile ? "w-full" : "sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent"} style={isMobile ? { width: '336px', height: '400px' } : {}}>
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className={isMobile ? "w-full p-4" : "sm:w-2/3 md:w-3/4 p-4 flex items-center justify-center"}>
          <div className="space-y-3 w-full">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});
