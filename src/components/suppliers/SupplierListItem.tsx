
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Instagram, Link as LinkIcon, Star, Heart } from 'lucide-react';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import type { Supplier } from '@/types';

interface SupplierListItemProps {
  supplier: Supplier;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
}

export function SupplierListItem({
  supplier,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice,
}: SupplierListItemProps) {
  const { hasExpired, isLoading, isVerified } = useTrialStatus();
  const isMobile = useIsMobile();

  if (supplier.isLockedForTrial) {
    return <LockedSupplierCard key={supplier.id} />;
  }

  // Se ainda está carregando o status do trial, mostrar apenas a foto com loading
  if (isLoading || !isVerified) {
    return (
      <Card key={supplier.id} className="overflow-hidden card-hover">
        <div className={isMobile ? "flex flex-col" : "sm:flex"}>
          <div className={isMobile ? "w-full" : "sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent"} style={isMobile ? { width: '346px', height: '400px' } : {}}>
            <img
              src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
              alt="Carregando..."
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className={isMobile ? "w-full p-4" : "sm:w-2/3 md:w-3/4 p-4 flex items-center justify-center"}>
            <div className="space-y-3 w-full">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Se o trial expirou E a verificação foi concluída, mostrar versão completamente bloqueada
  if (hasExpired && isVerified) {
    return (
      <Card key={supplier.id} className="overflow-hidden card-hover">
        <div className={isMobile ? "flex flex-col" : "sm:flex"}>
          <div className={isMobile ? "w-full" : "sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent"} style={isMobile ? { width: '346px', height: '400px' } : {}}>
            <img
              src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
              alt="Fornecedor"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className={isMobile ? "w-full p-4 flex items-center justify-center" : "sm:w-2/3 md:w-3/4 p-4 flex items-center justify-center"}>
            <div className="text-center p-6">
              <h3 className="text-lg font-bold mb-2">Conteúdo Bloqueado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seu período gratuito expirou. Assine para ver todos os detalhes dos fornecedores.
              </p>
              <Button asChild>
                <Link to="/auth/payment">Assinar agora</Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  const images = supplier.images && supplier.images.length > 0 ? supplier.images : ['/placeholder.svg'];
  const hasMultipleImages = images.length > 1;

  return (
    <Card key={supplier.id} className="overflow-hidden card-hover">
      <div className={isMobile ? "flex flex-col" : "sm:flex"}>
        <div className={isMobile ? "w-full relative" : "sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent relative"} style={isMobile ? { width: '346px', height: '400px' } : {}}>
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${supplier.name} - Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {hasMultipleImages && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-8 w-8" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white border-none hover:bg-black/70 h-8 w-8" />
                
                {/* Indicadores de pontos */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className="w-2 h-2 rounded-full bg-white/50"
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        </div>
        
        <CardContent className={isMobile ? "w-full p-4" : "sm:w-2/3 md:w-3/4 p-4"}>
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
              title={isFavorite(supplier.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite(supplier.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                }`}
              />
              <span className="sr-only">
                {isFavorite(supplier.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </span>
            </Button>
          </div>

          <p className={`text-sm line-clamp-2 ${isMobile ? 'mb-3' : 'mb-4'}`}>{supplier.description}</p>

          <div className={`flex flex-wrap gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
            {supplier.categories && supplier.categories.length > 0 ? (
              supplier.categories.map((categoryId) => {
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

          <div className={`grid grid-cols-2 gap-2 text-sm ${isMobile ? 'mb-3' : 'mb-4'}`}>
            <div>
              <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || 'Não informado'}
            </div>
            <div>
              <span className="font-medium">Preço médio:</span> {formatAvgPrice(supplier.avg_price || '')}
            </div>
          </div>

          <div className={`flex flex-wrap gap-2 ${isMobile ? 'flex-col' : ''}`}>
            <div className={`flex gap-2 ${isMobile ? 'mb-2' : ''}`}>
              {supplier.instagram && (
                <Button size="sm" variant="outline" asChild className={isMobile ? 'flex-1' : ''}>
                  <a
                    href={`https://instagram.com/${supplier.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="mr-1 h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}
              {supplier.website && (
                <Button size="sm" variant="outline" asChild className={isMobile ? 'flex-1' : ''}>
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-1 h-4 w-4" />
                    Site
                  </a>
                </Button>
              )}
            </div>
            <Button size="sm" asChild className={isMobile ? 'w-full' : ''}>
              <Link to={`/suppliers/${supplier.id}`}>Ver detalhes</Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
