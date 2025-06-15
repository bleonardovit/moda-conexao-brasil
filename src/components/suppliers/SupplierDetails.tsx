
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface SupplierDetailsProps {
  description: string;
  categories: string[];
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
}

export const SupplierDetails = memo(function SupplierDetails({ 
  description, 
  categories, 
  getCategoryName, 
  getCategoryStyle 
}: SupplierDetailsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <p className={`text-sm line-clamp-2 ${isMobile ? 'mb-3' : 'mb-4'}`}>
        {description}
      </p>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
        {categories && categories.length > 0 ? (
          categories.map((categoryId) => {
            const categoryName = getCategoryName(categoryId);
            const categoryStyle = getCategoryStyle(categoryName);
            return categoryName ? (
              <Badge key={categoryId} variant="outline" className={categoryStyle || ''}>
                {categoryName}
              </Badge>
            ) : null;
          })
        ) : (
          <span className="text-xs text-muted-foreground">Sem categorias</span>
        )}
      </div>
    </>
  );
});
