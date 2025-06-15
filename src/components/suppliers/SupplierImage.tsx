
import React, { useState, useRef, useEffect, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';

interface SupplierImageProps {
  images: string[];
  supplierName: string;
}

export const SupplierImage = memo(function SupplierImage({ images, supplierName }: SupplierImageProps) {
  const isMobile = useIsMobile();
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

  const containerStyle = isMobile 
    ? { width: '336px', height: '400px' } 
    : {};

  return (
    <div 
      ref={containerRef}
      className={isMobile ? "w-full relative" : "sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent relative"} 
      style={containerStyle}
    >
      <Carousel className={isMobile ? "h-full" : "w-full h-full"} style={containerStyle}>
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
            <CarouselPrevious className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-5 w-5" />
            <CarouselNext className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-5 w-5" />
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              {displayImages.map((_, index) => (
                <div
                  key={index}
                  className="w-1 h-1 rounded-full bg-white/60"
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
});
