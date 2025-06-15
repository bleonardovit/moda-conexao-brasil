
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, Heart } from 'lucide-react';
import type { Supplier } from '@/types';

interface SupplierHeaderProps {
  supplier: Supplier;
  isFavorite: boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
}

export const SupplierHeader = memo(function SupplierHeader({ 
  supplier, 
  isFavorite, 
  onToggleFavorite 
}: SupplierHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-lg font-bold flex items-center">
          {supplier.name}
          {supplier.featured && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                </TooltipTrigger>
                <TooltipContent>Fornecedor em destaque</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mb-1">
          {supplier.city}, {supplier.state}
        </p>
        <p className="text-xs text-muted-foreground mb-2">Código: {supplier.code}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 flex-shrink-0"
        onClick={(e) => onToggleFavorite(supplier, e)}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart
          className={`h-5 w-5 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          }`}
        />
        <span className="sr-only">
          {isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        </span>
      </Button>
    </div>
  );
});
