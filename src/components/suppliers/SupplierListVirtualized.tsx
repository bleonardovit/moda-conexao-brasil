
import React, { useRef, useEffect, useCallback } from "react";
import { SupplierListItem } from "@/components/suppliers/SupplierListItem";
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

  // Infinite scroll trigger
  useEffect(() => {
    if (!hasNextPage || isLoading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, hasNextPage, isLoading, fetchNextPage]);

  return (
    <div className="space-y-4">
      {suppliers.map(supplier => (
        <SupplierListItem
          key={supplier.id}
          supplier={supplier}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          getCategoryName={getCategoryName}
          getCategoryStyle={getCategoryStyle}
          formatAvgPrice={formatAvgPrice}
        />
      ))}
      <div ref={loaderRef} />
      {isLoading && (
        <div className="flex justify-center p-4">
          <span className="text-muted-foreground">Carregando mais fornecedores...</span>
        </div>
      )}
      {!hasNextPage && (
        <div className="flex justify-center p-2 text-xs text-muted-foreground">
          Fim dos fornecedores
        </div>
      )}
    </div>
  );
};
