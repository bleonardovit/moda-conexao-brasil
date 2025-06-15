
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { OptimizedSupplierCard } from '@/components/suppliers/OptimizedSupplierCard';
import { SkeletonCard } from './SkeletonCard';
import { Supplier } from '@/types';
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  if (featuredSuppliers.length === 0) return null;
  return (
    <section className="mb-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores em Destaque</h2>
        <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loadingSuppliers ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={`featured-skeleton-${i}`} />)}
        </div>
      ) : (
        <div className="w-full max-w-full overflow-x-auto">
          <Carousel opts={{
            align: "start",
            loop: featuredSuppliers.length > (isMobile ? 1 : 3)
          }} className="w-full max-w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredSuppliers.map(supplier => (
                <CarouselItem key={supplier.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 w-full max-w-full">
                  <OptimizedSupplierCard
                    supplier={supplier}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavorite}
                    getCategoryName={getCategoryName}
                    getCategoryStyle={getCategoryStyle}
                    formatAvgPrice={formatAvgPrice}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {featuredSuppliers.length > (isMobile ? 1 : 3) && (
              <>
                <CarouselPrevious className="left-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
                <CarouselNext className="right-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </section>
  );
}
