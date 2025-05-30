
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Link as LinkIcon, Star, Heart, Lock } from 'lucide-react';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Supplier } from '@/types';

interface SupplierListItemProps {
  supplier: Supplier;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (supplier: Supplier, e: React.MouseEvent) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryStyle: (categoryName: string) => string;
  formatAvgPrice: (price: string) => string;
  isTrialExpired?: boolean;
}

export function SupplierListItem({
  supplier,
  isFavorite,
  onToggleFavorite,
  getCategoryName,
  getCategoryStyle,
  formatAvgPrice,
  isTrialExpired = false
}: SupplierListItemProps) {
  
  // Se o trial expirou, mostra o card bloqueado
  if (isTrialExpired) {
    return (
      <Card className="glass-morphism border-white/10 p-4 opacity-50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
            <Lock className="h-8 w-8 text-gray-400" />
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Lock className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Bloqueado</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-500">Fornecedor protegido</h3>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Trial expirado
                </Badge>
              </div>
            </div>
            <p className="text-gray-400 mb-3 line-clamp-2">
              Conteúdo disponível apenas para assinantes
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-gray-400">
                Categoria protegida
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Acesso restrito</span>
              <Link 
                to="/auth/select-plan" 
                className="text-[#9b87f5] hover:text-[#D946EF] font-medium transition-colors"
              >
                Assinar para ver →
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link to={`/suppliers/${supplier.id}`}>
      <Card className="glass-morphism border-white/10 hover:border-[#9b87f5]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#9b87f5]/10 group">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-48 h-32 overflow-hidden rounded-lg">
              <img
                src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'}
                alt={supplier.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
                }}
              />
              {supplier.featured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-[#F97316]/90 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Destaque
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold group-hover:text-[#9b87f5] transition-colors">{supplier.name}</h3>
                <div className="flex gap-2 items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => onToggleFavorite(supplier, e)}
                          className="text-gray-400 hover:text-[#D946EF] transition-colors p-1"
                        >
                          <Heart className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-[#D946EF] text-[#D946EF]" : ""}`} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFavorite(supplier.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {supplier.instagram && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={supplier.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-pink-500 transition-colors p-1"
                          >
                            <Instagram className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver Instagram</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {supplier.website && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          >
                            <LinkIcon className="h-5 w-5" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visitar site</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-3 line-clamp-2">{supplier.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {supplier.categories && supplier.categories.slice(0, 3).map((categoryId) => {
                  const categoryName = getCategoryName(categoryId);
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className={getCategoryStyle(categoryName) || ""}
                    >
                      {categoryName}
                    </Badge>
                  );
                })}
                {supplier.categories && supplier.categories.length > 3 && (
                  <Badge variant="outline">
                    +{supplier.categories.length - 3} mais
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    {supplier.city}, {supplier.state}
                  </span>
                  {supplier.avg_price && (
                    <span className="text-sm font-medium">
                      Preço médio: {formatAvgPrice(supplier.avg_price)}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {supplier.requires_cnpj && (
                    <Badge variant="outline" className="text-xs">
                      Exige CNPJ
                    </Badge>
                  )}
                  {supplier.min_order && (
                    <Badge variant="outline" className="text-xs">
                      Pedido mín: {supplier.min_order}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
