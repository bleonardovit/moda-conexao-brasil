
import React, { useRef, useEffect, useCallback } from "react";
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import type { Supplier } from "@/types";

interface SupplierListVirtualizedProps {
  suppliers: Supplier[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
}

export const SupplierListVirtualized: React.FC<SupplierListVirtualizedProps> = ({
  suppliers,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice,
  fetchNextPage,
  hasNextPage,
  isLoading
}) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll trigger otimizado
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoading, fetchNextPage]);

  useEffect(() => {
    if (!hasNextPage || isLoading) return;
    
    const observer = new IntersectionObserver(handleIntersection, { 
      threshold: 0.1,
      rootMargin: '100px' // Pre-carrega quando está próximo
    });
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [handleIntersection, hasNextPage, isLoading]);

  return (
    <div className="space-y-4">
      {suppliers.map(supplier => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          getCategoryName={getCategoryName}
          getCategoryStyle={getCategoryStyle}
          formatAvgPrice={formatAvgPrice}
        />
      ))}
      <div ref={loaderRef} className="h-4" />
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Carregando mais fornecedores...</span>
          </div>
        </div>
      )}
      {!hasNextPage && suppliers.length > 0 && (
        <div className="flex justify-center p-2 text-xs text-muted-foreground">
          Fim dos fornecedores
        </div>
      )}
    </div>
  );
};
