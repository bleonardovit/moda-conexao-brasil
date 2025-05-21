import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, Instagram, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { useFavorites } from '@/hooks/use-favorites';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast as sonnerToast } from "@/components/ui/sonner";
import type { Supplier, Category } from '@/types';
import { getSuppliers, getSupplierCategories } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';

export default function Favorites() {
  const [searchTerm, setSearchTerm] = useState('');
  const { favorites: favoriteIds, removeFavorite, isLoading: isLoadingFavorites } = useFavorites();
  const { user } = useAuth();

  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [allCategoriesFetched, setAllCategoriesFetched] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingSuppliers(true);
      setIsLoadingCategories(true);

      if (!user?.id) {
        console.warn("Favorites: User not authenticated. Cannot load favorites.");
        // sonnerToast.error("Autenticação necessária", { // This was causing issues without user interaction
        //   description: "Você precisa estar logado para ver seus favoritos."
        // });
        setIsLoadingSuppliers(false);
        setIsLoadingCategories(false);
        setAllSuppliers([]);
        setAllCategoriesFetched([]);
        return;
      }
      const userId = user.id;

      try {
        const [suppliersData, categoriesData] = await Promise.all([
          getSuppliers(userId), // Pass userId
          getCategories()       // Call without userId
        ]);

        setAllCategoriesFetched(categoriesData);

        const suppliersWithCategories = await Promise.all(
          suppliersData.map(async (supplier) => {
            const categoryIdsForSupplier = await getSupplierCategories(supplier.id); // This seems fine
            return {
              ...supplier,
              categories: categoryIdsForSupplier
            };
          })
        );
        setAllSuppliers(suppliersWithCategories);

      } catch (error) {
        console.error("Erro ao buscar dados para favoritos:", error);
        sonnerToast.error("Erro ao carregar dados", {
          description: "Não foi possível buscar os dados necessários."
        });
      } finally {
        setIsLoadingSuppliers(false);
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, [user]); // Removed userId from dependency array as it's derived from user

  const getCategoryNameFromId = (categoryId: string): string => {
    const foundCategory = allCategoriesFetched.find(cat => cat.id === categoryId);
    return foundCategory ? foundCategory.name : categoryId;
  };

  // Filter suppliers to show only favorites
  const favoriteSuppliers = allSuppliers.filter(supplier => 
    favoriteIds.includes(supplier.id) && 
    (searchTerm === '' || 
     supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (supplier.description && supplier.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const formatAvgPrice = (price?: string) => {
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
    
    sonnerToast("Fornecedor removido", {
      description: `${supplier.name} foi removido dos seus favoritos`,
      duration: 2000,
    });
  };

  if (isLoadingFavorites || isLoadingSuppliers || isLoadingCategories) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <p>Carregando seus favoritos...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 container mx-auto px-4 py-8">
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
          {favoriteSuppliers.length} fornecedor(es) nos favoritos
        </div>
        
        {favoriteSuppliers.length === 0 && !isLoadingSuppliers && !isLoadingFavorites && !isLoadingCategories && (
          <div className="text-center py-10">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-4">
              Explore os fornecedores e clique no coração para adicioná-los aqui.
            </p>
            <Button asChild>
              <Link to="/suppliers">Encontrar Fornecedores</Link>
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteSuppliers.map(supplier => (
            <Card key={supplier.id} className="overflow-hidden card-hover animate-fade-in flex flex-col">
              <Link to={`/suppliers/${supplier.id}`} className="block h-48 bg-accent">
                <img 
                  src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : 'https://via.placeholder.com/300x200?text=Sem+Imagem'} 
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center">
                      <Link to={`/suppliers/${supplier.id}`} className="hover:underline">
                        {supplier.name}
                      </Link>
                      {supplier.featured && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Fornecedor em destaque
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.state}</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                          onClick={(e) => handleRemoveFavorite(supplier, e)}
                        >
                          <Heart className="h-5 w-5 fill-current" />
                          <span className="sr-only">Remover dos favoritos</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Remover dos favoritos
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow min-h-[40px]">{supplier.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {supplier.categories.map(categoryId => {
                    const categoryName = getCategoryNameFromId(categoryId);
                    return (
                      <Badge 
                        key={categoryId} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {categoryName}
                      </Badge>
                    );
                  })}
                </div>
                
                <div className="mt-auto flex flex-wrap gap-2">
                  {supplier.instagram && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="mr-1 h-4 w-4" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
