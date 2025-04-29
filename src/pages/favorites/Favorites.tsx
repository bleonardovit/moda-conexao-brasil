
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, Instagram, Link as LinkIcon, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { useFavorites } from '@/hooks/use-favorites';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner";
import type { Supplier } from '@/types';

// Using the same mock suppliers as in the SuppliersList component
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    code: 'SP001',
    name: 'Moda Fashion SP',
    description: 'Atacado de roupas femininas com foco em tendências atuais',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'],
    instagram: '@modafashionsp',
    whatsapp: '+5511999999999',
    min_order: 'R$ 300,00',
    payment_methods: ['pix', 'card', 'bankslip'],
    requires_cnpj: true,
    avg_price: 'medium',
    shipping_methods: ['correios', 'transporter'],
    city: 'São Paulo',
    state: 'SP',
    categories: ['Casual', 'Fitness'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2',
    code: 'CE001',
    name: 'Brindes Fortaleza',
    description: 'Acessórios e bijuterias para revenda',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb'],
    instagram: '@brindesfortaleza',
    whatsapp: '+5585999999999',
    min_order: 'R$ 200,00',
    payment_methods: ['pix', 'bankslip'],
    requires_cnpj: false,
    avg_price: 'low',
    shipping_methods: ['correios'],
    city: 'Fortaleza',
    state: 'CE',
    categories: ['Acessórios'],
    featured: false,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '3',
    code: 'GO001',
    name: 'Plus Size Goiânia',
    description: 'Especializada em moda plus size feminina',
    images: ['https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'],
    instagram: '@plussizegoiania',
    whatsapp: '+5562999999999',
    website: 'https://plussizegoiania.com.br',
    min_order: 'R$ 500,00',
    payment_methods: ['pix', 'card'],
    requires_cnpj: true,
    avg_price: 'medium',
    shipping_methods: ['correios', 'transporter'],
    city: 'Goiânia',
    state: 'GO',
    categories: ['Plus Size'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

export default function Favorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const { favorites, removeFavorite } = useFavorites();
  const { toast: uiToast } = useToast();

  // Filter suppliers to show only favorites
  const favoriteSuppliers = MOCK_SUPPLIERS.filter(supplier => 
    favorites.includes(supplier.id) && 
    (searchTerm === '' || 
     supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     supplier.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatAvgPrice = (price: string) => {
    switch(price) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Não informado';
    }
  };

  const handleRemoveFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    removeFavorite(supplier.id);
    
    toast("Fornecedor removido", {
      description: `${supplier.name} foi removido dos seus favoritos`,
      duration: 2000,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meus Favoritos</h1>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to="/suppliers">
              Ver todos os fornecedores
            </Link>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar entre meus favoritos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="text-sm text-muted-foreground text-right">
          {favoriteSuppliers.length} fornecedores nos favoritos
        </div>
        
        <div className="space-y-4">
          {favoriteSuppliers.length > 0 ? (
            favoriteSuppliers.map(supplier => (
              <Card key={supplier.id} className="overflow-hidden card-hover animate-fade-in">
                <div className="sm:flex">
                  <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
                    <img 
                      src={supplier.images[0]} 
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
                                <TooltipContent>
                                  Fornecedor em destaque
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">{supplier.city}, {supplier.state}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={(e) => handleRemoveFavorite(supplier, e)}
                        title="Remover dos favoritos"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="sr-only">Remover dos favoritos</span>
                      </Button>
                    </div>
                    
                    <p className="text-sm mb-4 line-clamp-2">{supplier.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {supplier.categories.map(category => {
                        const categoryColors: Record<string, string> = {
                          'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                          'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                          'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                          'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
                          'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                        };
                        
                        return (
                          <Badge 
                            key={category} 
                            variant="outline"
                            className={categoryColors[category] || ''}
                          >
                            {category}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Pedido mínimo:</span> {supplier.min_order}
                      </div>
                      <div>
                        <span className="font-medium">Preço médio:</span> {formatAvgPrice(supplier.avg_price)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {supplier.instagram && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
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
                        <Link to={`/suppliers/${supplier.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-accent/10 rounded-lg animate-fade-in">
              <div className="max-w-md mx-auto p-6">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Nenhum favorito encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 
                    "Nenhum fornecedor favorito corresponde à sua busca." :
                    "Você ainda não adicionou nenhum fornecedor aos favoritos."}
                </p>
                <Button asChild>
                  <Link to="/suppliers">
                    Explorar fornecedores
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
