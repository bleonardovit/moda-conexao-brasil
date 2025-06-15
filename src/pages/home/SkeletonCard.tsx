
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

export function SkeletonCard() {
  const isMobile = useIsMobile();
  return (
    <Card className="glass-morphism border-white/10 overflow-hidden h-full w-full max-w-full">
      <Skeleton className="w-full" style={{
        height: isMobile ? '130px' : '180px'
      }} />
      <CardContent className="p-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between items-center mt-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
}
