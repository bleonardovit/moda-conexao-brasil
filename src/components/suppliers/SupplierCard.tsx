
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { useTrialContext } from '@/contexts/TrialContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SupplierImage } from './SupplierImage';
import { SupplierHeader } from './SupplierHeader';
import { SupplierDetails } from './SupplierDetails';
import { SupplierInfo } from './SupplierInfo';
import { SupplierActions } from './SupplierActions';
import { SupplierSkeleton } from './SupplierSkeleton';
import type { Supplier } from '@/types';

interface SupplierCardProps {
  supplier: Supplier;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
}

export const SupplierCard = memo(function SupplierCard({
  supplier,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice,
}: SupplierCardProps) {
  const { isLoading, isVerified } = useTrialContext();
  const isMobile = useIsMobile();

  // Use LockedSupplierCard for any supplier marked as locked for trial
  if (supplier.isLockedForTrial) {
    return <LockedSupplierCard key={supplier.id} />;
  }

  // Show skeleton while loading or not verified
  if (isLoading || !isVerified) {
    return <SupplierSkeleton />;
  }

  // Main render - normal supplier card
  return (
    <Card key={supplier.id} className="overflow-hidden card-hover">
      <div className={isMobile ? "flex flex-col" : "sm:flex"}>
        <SupplierImage 
          images={supplier.images || []} 
          supplierName={supplier.name} 
        />
        
        <CardContent className={`p-4 w-full h-full ${isMobile ? 'w-full' : 'sm:w-2/3 md:w-3/4'}`}>
          <SupplierHeader 
            supplier={supplier}
            isFavorite={isFavorite(supplier.id)}
            onToggleFavorite={onToggleFavorite}
          />

          <SupplierDetails 
            description={supplier.description}
            categories={supplier.categories || []}
            getCategoryName={getCategoryName}
            getCategoryStyle={getCategoryStyle}
          />

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
        </CardContent>
      </div>
    </Card>
  );
});
