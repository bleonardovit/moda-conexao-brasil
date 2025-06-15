
import React, { memo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SupplierInfoProps {
  minOrder: string | null;
  avgPrice: string | null;
  formatAvgPrice: (price: string) => string;
}

export const SupplierInfo = memo(function SupplierInfo({ 
  minOrder, 
  avgPrice, 
  formatAvgPrice 
}: SupplierInfoProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`grid grid-cols-2 gap-2 text-sm ${isMobile ? 'mb-3' : 'mb-4'}`}>
      <div>
        <span className="font-medium">Pedido mínimo:</span> {minOrder || 'Não informado'}
      </div>
      <div>
        <span className="font-medium">Preço médio:</span> {formatAvgPrice(avgPrice || '')}
      </div>
    </div>
  );
});
