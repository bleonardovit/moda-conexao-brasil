import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { OptimizedSupplierCard } from '@/components/suppliers/OptimizedSupplierCard';
import { SkeletonCard } from './SkeletonCard';
import { Supplier } from '@/types';
import React from "react";
interface RecentSuppliersSectionProps {
  recentSuppliers: Supplier[];
  loadingSuppliers: boolean;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
}
export function RecentSuppliersSection({
  recentSuppliers,
  loadingSuppliers,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice
}: RecentSuppliersSectionProps) {
  return <section className="mb-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores Recentes</h2>
        <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loadingSuppliers ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={`recent-skeleton-${i}`} />)}
        </div> : recentSuppliers.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          {recentSuppliers.map(supplier => <div key={supplier.id} className="animate-fade-in h-full">
              <OptimizedSupplierCard supplier={supplier} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} getCategoryName={getCategoryName} getCategoryStyle={getCategoryStyle} formatAvgPrice={formatAvgPrice} />
            </div>)}
        </div> : <div className="flex flex-col items-center justify-center p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não há fornecedores cadastrados recentemente no sistema.
          </p>
        </div>}
    </section>;
}