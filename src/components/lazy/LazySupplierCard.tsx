
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/use-favorites';
import type { Supplier, Category } from '@/types';

// Lazy load do SupplierCard para otimizar bundle
const SupplierCard = lazy(() => 
  import('@/components/suppliers/SupplierCard').then(module => ({
    default: module.SupplierCard
  }))
);

const SupplierCardSkeleton = () => (
  <div className="glass-morphism border-white/10 overflow-hidden h-full w-full max-w-full rounded-lg">
    <Skeleton className="w-full h-[180px]" />
    <div className="p-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex justify-between items-center mt-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  </div>
);

interface LazySupplierCardProps {
  supplier: Supplier;
  allCategories: Category[];
  priority?: 'high' | 'normal' | 'low';
}

export function LazySupplierCard({ supplier, allCategories, priority = 'normal' }: LazySupplierCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const getCategoryName = (categoryId: string): string => {
    const foundCategory = allCategories.find(cat => cat.id === categoryId);
    return foundCategory ? foundCategory.name : categoryId;
  };

  const getCategoryStyle = (categoryName: string): string => {
    // Simple category styling
    return "bg-white/10";
  };

  const formatAvgPrice = (price: string): string => {
    const priceMap = {
      'low': 'Baixo',
      'medium': 'Médio', 
      'high': 'Alto'
    };
    return priceMap[price as keyof typeof priceMap] || price;
  };

  const handleToggleFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(supplier.id);
  };

  return (
    <Suspense fallback={<SupplierCardSkeleton />}>
      <SupplierCard 
        supplier={supplier} 
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        getCategoryName={getCategoryName}
        getCategoryStyle={getCategoryStyle}
        formatAvgPrice={formatAvgPrice}
      />
    </Suspense>
  );
}
