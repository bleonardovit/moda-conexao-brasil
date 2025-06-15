
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { OptimizedSupplierCard } from '@/components/suppliers/OptimizedSupplierCard';
import { SkeletonCard } from './SkeletonCard';
import { Supplier } from '@/types';
import React from "react";

interface FeaturedSuppliersSectionProps {
  featuredSuppliers: Supplier[];
  loadingSuppliers: boolean;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
}

export function FeaturedSuppliersSection({
  featuredSuppliers,
  loadingSuppliers,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice
}: FeaturedSuppliersSectionProps) {
  if (featuredSuppliers.length === 0) return null;
  
  return (
    <section className="mb-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores em Destaque</h2>
        <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loadingSuppliers ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={`featured-skeleton-${i}`} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          {featuredSuppliers.map(supplier => (
            <div key={supplier.id} className="animate-fade-in h-full">
              <OptimizedSupplierCard
                supplier={supplier}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                getCategoryName={getCategoryName}
                getCategoryStyle={getCategoryStyle}
                formatAvgPrice={formatAvgPrice}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
