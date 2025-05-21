import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Instagram, Link as LinkIcon, Star, Heart, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { useFavorites } from '@/hooks/use-favorites';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { LockedSupplierCard } from '@/components/trial/LockedSupplierCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import type { Supplier, Category } from '@/types';
import { getSuppliers } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';

// Define states array
const STATES = [{
  label: 'Todos',
  value: 'all'
}, {
  label: 'São Paulo',
  value: 'SP'
}, {
  label: 'Ceará',
  value: 'CE'
}, {
  label: 'Goiás',
  value: 'GO'
}, {
  label: 'Pernambuco',
  value: 'PE'
}];

// Add cities filter
const CITIES = [{
  label: 'Todas',
  value: 'all'
}, {
  label: 'São Paulo',
  value: 'São Paulo'
}, {
  label: 'Fortaleza',
  value: 'Fortaleza'
}, {
  label: 'Goiânia',
  value: 'Goiânia'
}, {
  label: 'Recife',
  value: 'Recife'
}];
const PRICE_RANGES = [{
  label: 'Todos',
  value: 'all'
}, {
  label: 'Baixo',
  value: 'low'
}, {
  label: 'Médio',
  value: 'medium'
}, {
  label: 'Alto',
  value: 'high'
}];
const CNPJ_OPTIONS = [{
  label: 'Todos',
  value: 'all'
}, {
  label: 'Exige CNPJ',
  value: 'true'
}, {
  label: 'Não exige CNPJ',
  value: 'false'
}];
export default function SuppliersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [cnpjFilter, setCnpjFilter] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const {
    favorites,
    toggleFavorite,
    isFavorite
  } = useFavorites();
  const {
    toast
  } = useToast();
  const { user } = useAuth();

  // State for loading and data
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{
    label: string;
    value: string;
  }[]>([{
    label: 'Todas',
    value: 'all'
  }]);
  // Novos estados para opções de filtro dinâmicas
  const [stateOptions, setStateOptions] = useState<{
    label: string;
    value: string;
  }[]>([{
    label: 'Todos os Estados',
    value: 'all'
  }]);
  const [cityOptions, setCityOptions] = useState<{
    label: string;
    value: string;
  }[]>([{
    label: 'Todas as Cidades',
    value: 'all'
  }]);

  // Fetch suppliers and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Pass userId to getSuppliers
        const [suppliersData, categoriesData] = await Promise.all([
          getSuppliers(user?.id), 
          getCategories()
        ]);

        // Filter out hidden suppliers for regular users
        const visibleSuppliers = suppliersData.filter(supplier => !supplier.hidden);
        setSuppliers(visibleSuppliers);

        // Create category options
        setCategories(categoriesData);
        setCategoryOptions([{
          label: 'Todas as Categorias',
          value: 'all'
        },
        // Atualizado para consistência
        ...categoriesData.map(cat => ({
          label: cat.name,
          value: cat.id
        }))]);

        // Extrair e definir opções de estado dinamicamente
        const uniqueStates = Array.from(new Set(visibleSuppliers.map(s => s.state))).filter(Boolean);
        setStateOptions([{
          label: 'Todos os Estados',
          value: 'all'
        }, ...uniqueStates.map(st => ({
          label: st,
          value: st
        }))]);

        // Extrair e definir opções de cidade dinamicamente
        const uniqueCities = Array.from(new Set(visibleSuppliers.map(s => s.city))).filter(Boolean);
        setCityOptions([{
          label: 'Todas as Cidades',
          value: 'all'
        }, ...uniqueCities.map(city => ({
          label: city,
          value: city
        }))]);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast({
          title: "Erro ao carregar fornecedores",
          description: "Não foi possível carregar a lista de fornecedores. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast, user?.id]); // Add user.id to dependency array

  // Add trial status hook
  const { isInTrial, allowedSupplierIds, isSupplierAllowed } = useTrialStatus();
  const [supplierAccessMap, setSupplierAccessMap] = useState<Record<string, boolean>>({});

  // Function to check if supplier is accessible in trial mode
  const isSupplierAccessible = (supplierId: string): boolean => {
    if (!isInTrial) return true; // If not in trial, all suppliers are accessible
    return supplierAccessMap[supplierId] === true;
  };

  // Add effect to check which suppliers are allowed for trial users
  useEffect(() => {
    const checkSupplierAccess = async () => {
      if (!isInTrial || suppliers.length === 0) return;
      
      const accessMap: Record<string, boolean> = {};
      for (const supplier of suppliers) {
        accessMap[supplier.id] = await isSupplierAllowed(supplier.id);
      }
      
      setSupplierAccessMap(accessMap);
    };
    
    checkSupplierAccess();
  }, [suppliers, isInTrial, isSupplierAllowed]);

  const filteredSuppliers = suppliers.filter(supplier => {
    // Make sure supplier.categories exists before using it
    if (!supplier.categories) {
      return false;
    }
    const matchesSearch = searchTerm === '' || supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.description.toLowerCase().includes(searchTerm.toLowerCase()) || supplier.code && supplier.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || supplier.categories.includes(categoryFilter);
    const matchesState = stateFilter === 'all' || supplier.state === stateFilter;
    const matchesCity = cityFilter === 'all' || supplier.city === cityFilter;
    const matchesPrice = priceFilter === 'all' || supplier.avg_price === priceFilter;
    const matchesCnpj = cnpjFilter === 'all' || supplier.requires_cnpj === (cnpjFilter === 'true');
    const matchesFavorites = !showOnlyFavorites || isFavorite(supplier.id);
    return matchesSearch && matchesCategory && matchesState && matchesCity && matchesPrice && matchesCnpj && matchesFavorites;
  });
  const formatAvgPrice = (price: string) => {
    switch (price) {
      case 'low':
        return 'Baixo';
      case 'medium':
        return 'Médio';
      case 'high':
        return 'Alto';
      default:
        return 'Não informado';
    }
  };
  const handleToggleFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(supplier.id);
    const action = isFavorite(supplier.id) ? 'removido dos' : 'adicionado aos';
    toast({
      title: isFavorite(supplier.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${supplier.name} foi ${action} seus favoritos`,
      duration: 2000
    });
  };

  // Get category name by ID - with safeguards
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  // Generate category styling based on name
  const getCategoryStyle = (categoryName: string) => {
    const categoryColors: Record<string, string> = {
      'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return categoryColors[categoryName] || '';
  };
  if (isLoading) {
    return <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando fornecedores...</p>
        </div>
      </AppLayout>;
  }
  return <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <Button variant="outline" size="sm" onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={showOnlyFavorites ? "bg-accent text-accent-foreground" : ""}>
            <Heart className={`mr-2 h-4 w-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
            Favoritos
          </Button>
        </div>
        
        {/* Add trial banner here */}
        <TrialBanner />
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar fornecedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)} className={isFilterOpen ? "bg-accent text-accent-foreground" : ""}>
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {isFilterOpen ? " (ativos)" : ""}
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {filteredSuppliers.length} fornecedores encontrados
          </span>
        </div>
        
        {isFilterOpen && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map(state => <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map(city => <SelectItem key={city.value} value={city.value}>
                      {city.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Faixa de Preço</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma faixa" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map(price => <SelectItem key={price.value} value={price.value}>
                      {price.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Requisito CNPJ</label>
              <Select value={cnpjFilter} onValueChange={setCnpjFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Requisito CNPJ" />
                </SelectTrigger>
                <SelectContent>
                  {CNPJ_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>}
        
        <div className="space-y-4">
          {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
            isSupplierAccessible(supplier.id) ? (
              // Regular supplier card for accessible suppliers
              <Card key={supplier.id} className="overflow-hidden card-hover">
                <div className="sm:flex">
                  <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
                    <img src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'} alt={supplier.name} className="w-full h-full object-fill" />
                  </div>
                  <CardContent className="sm:w-2/3 md:w-3/4 p-4">
                    {/* ... keep existing code (supplier card content) */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold flex items-center">
                          {supplier.name}
                          {supplier.featured && <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Fornecedor em destaque
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">{supplier.city}, {supplier.state}</p>
                        <p className="text-xs text-muted-foreground mb-2">Código: {supplier.code}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => handleToggleFavorite(supplier, e)} title={isFavorite(supplier.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                        <Heart className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        <span className="sr-only">
                          {isFavorite(supplier.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        </span>
                      </Button>
                    </div>
                    
                    <p className="text-sm mb-4 line-clamp-2">{supplier.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {supplier.categories && supplier.categories.length > 0 ? supplier.categories.map(categoryId => {
                  const categoryName = getCategoryName(categoryId);
                  const categoryStyle = getCategoryStyle(categoryName);
                  return categoryName ? <Badge key={categoryId} variant="outline" className={categoryStyle || ''}>
                              {categoryName}
                            </Badge> : null;
                }) : <span className="text-xs text-muted-foreground">Sem categorias</span>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || "Não informado"}
                      </div>
                      <div>
                        <span className="font-medium">Preço médio:</span> {formatAvgPrice(supplier.avg_price || '')}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {supplier.instagram && <Button size="sm" variant="outline" asChild>
                          <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                            <Instagram className="mr-1 h-4 w-4" />
                            Instagram
                          </a>
                        </Button>}
                      
                      {supplier.website && <Button size="sm" variant="outline" asChild>
                          <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-1 h-4 w-4" />
                            Site
                          </a>
                        </Button>}
                      
                      <Button size="sm" asChild>
                        <Link to={`/suppliers/${supplier.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ) : (
              // Locked supplier card for inaccessible suppliers
              <LockedSupplierCard 
                key={supplier.id}
                name={supplier.name}
                city={supplier.city}
                state={supplier.state}
              />
            )
          )) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum fornecedor encontrado com os filtros selecionados.</p>
              <Button variant="link" onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStateFilter('all');
                setCityFilter('all');
                setPriceFilter('all');
                setCnpjFilter('all');
                setShowOnlyFavorites(false);
              }}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>;
}
