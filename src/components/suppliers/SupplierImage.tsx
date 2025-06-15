
import React, { useState, useRef, useEffect, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface SupplierImageProps {
  images: string[];
  supplierName: string;
}

export const SupplierImage = memo(function SupplierImage({ images, supplierName }: SupplierImageProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayImages = images && images.length > 0 ? images : ['/placeholder.svg'];
  const hasMultipleImages = displayImages.length > 1;

  // Intersection Observer para lazy loading real
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-48 bg-accent relative"
    >
      <Carousel className="w-full h-full">
        <CarouselContent>
          {displayImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="w-full h-full relative flex items-center justify-center bg-muted">
                {!loadedImages[index] && (
                  <Skeleton className="absolute w-full h-full" />
                )}
                {isVisible && (
                  <img
                    src={image}
                    alt={`${supplierName} - Imagem ${index + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      loadedImages[index] ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageLoad(index)}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {hasMultipleImages && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-8 w-8" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-8 w-8" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {displayImages.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-white/60"
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
});
