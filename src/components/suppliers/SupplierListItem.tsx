
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Instagram, Link as LinkIcon, Star, Heart } from 'lucide-react';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { useTrialStatus } from '@/hooks/use-trial-status';
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
  const { hasExpired } = useTrialStatus();

  if (supplier.isLockedForTrial) {
    return <LockedSupplierCard key={supplier.id} />;
  }

  // Se o trial expirou, mostrar conteúdo bloqueado
  if (hasExpired) {
    return (
      <Card key={supplier.id} className="overflow-hidden card-hover">
        <div className="sm:flex">
          <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
            <img
              src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
              alt="Fornecedor"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="sm:w-2/3 md:w-3/4 p-4 relative">
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center p-4">
                <h3 className="text-lg font-bold mb-2">Conteúdo Bloqueado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Seu período gratuito expirou. Assine para ver todos os detalhes dos fornecedores.
                </p>
                <Button asChild>
                  <Link to="/auth/payment">Assinar agora</Link>
                </Button>
              </div>
            </div>
            
            {/* Conteúdo borrado por baixo */}
            <div className="blur-sm opacity-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">████████████</h3>
                  <p className="text-sm text-muted-foreground mb-1">████████, ██</p>
                  <p className="text-xs text-muted-foreground mb-2">Código: ████████</p>
                </div>
              </div>
              <p className="text-sm mb-4">████████████████████████████████████████</p>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card key={supplier.id} className="overflow-hidden card-hover">
      <div className="sm:flex">
        <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
          <img
            src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
            alt={supplier.name}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="sm:w-2/3 md:w-3/4 p-4">
          <div className="flex items-start justify-between">
            <div>
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
              className="h-8 w-8"
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

          <p className="text-sm mb-4 line-clamp-2">{supplier.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
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

          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || 'Não informado'}
            </div>
            <div>
              <span className="font-medium">Preço médio:</span> {formatAvgPrice(supplier.avg_price || '')}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {supplier.instagram && (
              <Button size="sm" variant="outline" asChild>
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
              <Button size="sm" variant="outline" asChild>
                <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="mr-1 h-4 w-4" />
                  Site
                </a>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link to={`/suppliers/${supplier.id}`}>Ver detalhes</Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
