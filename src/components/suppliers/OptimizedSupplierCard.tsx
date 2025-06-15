
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { useTrialContext } from '@/contexts/TrialContext';
import { SupplierImage } from './SupplierImage';
import { SupplierHeader } from './SupplierHeader';
import { SupplierDetails } from './SupplierDetails';
import { SupplierInfo } from './SupplierInfo';
import { SupplierActions } from './SupplierActions';
import { SupplierSkeleton } from './SupplierSkeleton';
import type { Supplier } from '@/types';

interface OptimizedSupplierCardProps {
  supplier: Supplier;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
}

export const OptimizedSupplierCard = memo(function OptimizedSupplierCard({
  supplier,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice,
}: OptimizedSupplierCardProps) {
  const { isLoading, isVerified } = useTrialContext();

  // Use LockedSupplierCard for any supplier marked as locked for trial
  if (supplier.isLockedForTrial) {
    return <LockedSupplierCard key={supplier.id} />;
  }

  // Show skeleton while loading or not verified
  if (isLoading || !isVerified) {
    return <SupplierSkeleton />;
  }

  // Main render - vertical layout with image on top
  return (
    <Card key={supplier.id} className="overflow-hidden card-hover h-full flex flex-col">
      <SupplierImage 
        images={supplier.images || []} 
        supplierName={supplier.name} 
      />
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <SupplierHeader 
          supplier={supplier}
          isFavorite={isFavorite(supplier.id)}
          onToggleFavorite={onToggleFavorite}
        />

        <div className="flex-1 flex flex-col justify-between">
          <SupplierDetails 
            description={supplier.description}
            categories={supplier.categories || []}
            getCategoryName={getCategoryName}
            getCategoryStyle={getCategoryStyle}
          />

          <div className="mt-auto space-y-3">
            <SupplierInfo 
              minOrder={supplier.min_order}
              avgPrice={supplier.avg_price}
              formatAvgPrice={formatAvgPrice}
            />

            <SupplierActions 
              supplierId={supplier.id}
              instagram={supplier.instagram}
              website={supplier.website}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
