import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Heart, Instagram, Link as LinkIcon, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Link } from 'react-router-dom';
import type { Supplier, Category, SearchFilters } from '@/types';
import { searchSuppliers, getSuppliers } from '@/services/supplierService';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';

// Filter options
const PAYMENT_METHODS = [
  { label: 'PIX', value: 'pix' },
  { label: 'Cartão', value: 'card' },
  { label: 'Boleto', value: 'bankslip' }
];

const SHIPPING_METHODS = [
  { label: 'Correios', value: 'correios' },
  { label: 'Transportadora', value: 'transporter' },
  { label: 'Entrega local', value: 'delivery' }
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  // State for categories
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([{ label: 'Todas as Categorias', value: 'all' }]);
  const [categoryFilter, setCategoryFilter] = useState('all'); // Stores category ID or 'all'
  
  // Estados para opções dinâmicas de estado e cidade
  const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([{ label: 'Todos os Estados', value: 'all' }]);
  const [cityOptions, setCityOptions] = useState<{ label: string; value: string }[]>([{ label: 'Todas as Cidades', value: 'all' }]);
  
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [minOrderRange, setMinOrderRange] = useState<[number, number]>([0, 1000]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [requiresCnpj, setRequiresCnpj] = useState<string | null>(null);
  const [selectedShippingMethods, setSelectedShippingMethods] = useState<string[]>([]);
  const [hasWebsite, setHasWebsite] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{[key: string]: boolean}>({});

  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  // Fetch categories, states, and cities for filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories(); // Call without userId
        setAllCategories(categoriesData);
        const catOptions = [
          { label: 'Todas as Categorias', value: 'all' },
          ...categoriesData.map(cat => ({ label: cat.name, value: cat.id }))
        ];
        setCategoryOptions(catOptions);

        // Fetch all suppliers to derive states and cities
        const allSuppliersData = await getSuppliers(userId); // Pass userId
        
        const visibleSuppliers = allSuppliersData.filter(s => !s.hidden);

        const uniqueStates = Array.from(new Set(visibleSuppliers.map(s => s.state).filter(Boolean)));
        const stOptions = [
          { label: 'Todos os Estados', value: 'all' },
          ...uniqueStates.sort().map(st => ({ label: st, value: st }))
        ];
        setStateOptions(stOptions);

        // Filter cities based on selected state
        const citiesForSelectedState = stateFilter === 'all' 
          ? visibleSuppliers 
          : visibleSuppliers.filter(s => s.state === stateFilter);
        
        const uniqueCities = Array.from(new Set(citiesForSelectedState.map(s => s.city).filter(Boolean)));
        const cOptions = [
          { label: 'Todas as Cidades', value: 'all' },
          ...uniqueCities.sort().map(city => ({ label: city, value: city }))
        ];
        setCityOptions(cOptions);

      } catch (error) {
        console.error("Error fetching filter options:", error);
        toast({
          title: "Erro ao carregar opções de filtro",
          description: "Não foi possível buscar dados para os filtros.",
          variant: "destructive",
        });
      }
    };
    fetchFilterOptions();
  }, [toast, userId, stateFilter]);

  // Query suppliers from the database with filters
  const { data: suppliers = [], isLoading, error } = useQuery<Supplier[], Error>({
    queryKey: ['suppliers', searchTerm, categoryFilter, stateFilter, cityFilter, 
               minOrderRange, selectedPaymentMethods, requiresCnpj, 
               selectedShippingMethods, hasWebsite, userId],
    queryFn: async () => {
      // Construct filters object for searchSuppliers
      const filters: SearchFilters = {
        searchTerm: searchTerm || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        state: stateFilter !== 'all' ? stateFilter : undefined,
        city: cityFilter !== 'all' ? cityFilter : undefined,
        minOrderRange: (minOrderRange[0] > 0 || minOrderRange[1] < 1000) ? minOrderRange : undefined,
        paymentMethods: selectedPaymentMethods.length > 0 ? selectedPaymentMethods : undefined,
        requiresCnpj: requiresCnpj !== null ? requiresCnpj === 'true' : undefined,
        shippingMethods: selectedShippingMethods.length > 0 ? selectedShippingMethods : undefined,
        hasWebsite: hasWebsite !== null ? hasWebsite === 'true' : undefined,
      };
      try {
        return await searchSuppliers(filters, userId);
      } catch (searchError) {
        console.error("Error fetching suppliers in queryFn:", searchError);
        toast({
          title: "Erro ao buscar fornecedores",
          description: (searchError as Error).message || "Ocorreu um problema na busca.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Log filtered suppliers
  useEffect(() => {
    console.log("Filtered suppliers:", suppliers);
  }, [suppliers]);

  // Update active filters state whenever filters change
  useEffect(() => {
    const newActiveFilters = {
      category: categoryFilter !== 'all',
      state: stateFilter !== 'all',
      city: cityFilter !== 'all',
      minOrder: minOrderRange[0] > 0 || minOrderRange[1] < 1000,
      paymentMethod: selectedPaymentMethods.length > 0,
      cnpj: requiresCnpj !== null,
      shipping: selectedShippingMethods.length > 0,
      website: hasWebsite !== null
    };
    
    setActiveFilters(newActiveFilters);
  }, [
    categoryFilter, stateFilter, cityFilter, minOrderRange, 
    selectedPaymentMethods, requiresCnpj, selectedShippingMethods, hasWebsite
  ]);

  // Count active filters
  const activeFiltersCount = Object.values(activeFilters).filter(Boolean).length;

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(m => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  // Handle shipping method change
  const handleShippingMethodChange = (method: string) => {
    setSelectedShippingMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(m => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setMinOrderRange([0, 1000]);
    setSelectedPaymentMethods([]);
    setRequiresCnpj(null);
    setSelectedShippingMethods([]);
    setHasWebsite(null);
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos",
      duration: 2000
    });
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(0)}`;
  };

  // Handle toggle favorite
  const handleToggleFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentlyFavorite = isFavorite(supplier.id);
    toggleFavorite(supplier.id);
    
    const action = currentlyFavorite ? 'removido dos' : 'adicionado aos';
    const title = currentlyFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos";
    
    toast({
      title: title,
      description: `${supplier.name} foi ${action} seus favoritos.`,
      duration: 2000,
    });
  };
  
  useEffect(() => {
    if (stateFilter !== 'all') {
        setCityFilter('all'); 
    }
  }, [stateFilter]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-foreground">Pesquisar Fornecedores</h1>
            
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground" title="Buscar" />
              <Input
                placeholder="Pesquisar por nome, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={isFilterOpen ? "bg-accent text-accent-foreground" : ""}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
                )}
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {isLoading ? "Carregando..." : `${suppliers.length} ${suppliers.length === 1 ? "resultado" : "resultados"} encontrado${suppliers.length === 1 ? "" : "s"}`}
              </span>
            </div>

            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="animate-collapsible-down">
                <div className="bg-muted/50 rounded-md p-4 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Refinar busca</h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      Limpar filtros
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Category filter */}
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={categoryFilter} 
                        onValueChange={setCategoryFilter}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecionar categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* State filter */}
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select 
                        value={stateFilter} 
                        onValueChange={(value) => {
                            setStateFilter(value);
                            // City filter will be reset by the useEffect hook for stateFilter
                        }}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Selecione um estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateOptions.map(stateOpt => (
                            <SelectItem key={stateOpt.value} value={stateOpt.value}>
                              {stateOpt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City filter */}
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Select 
                        value={cityFilter} 
                        onValueChange={setCityFilter}
                        disabled={stateFilter === 'all' && cityOptions.length <= 1}
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder={stateFilter === 'all' ? "Selecione um estado primeiro" : "Selecione uma cidade"} />
                        </SelectTrigger>
                        <SelectContent>
                          {cityOptions.map(cityOpt => (
                            <SelectItem key={cityOpt.value} value={cityOpt.value}>
                              {cityOpt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Min order range filter */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="min-order">Pedido mínimo</Label>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(minOrderRange[0])} - {formatCurrency(minOrderRange[1])}
                          {minOrderRange[1] === 1000 && '+'}
                        </span>
                      </div>
                      <Slider 
                        id="min-order"
                        max={1000} 
                        step={50}
                        value={minOrderRange}
                        onValueChange={(value) => setMinOrderRange(value as [number, number])} 
                        className="py-4"
                      />
                    </div>

                    {/* Payment methods filter */}
                    <div className="space-y-2">
                      <Label>Forma de pagamento</Label>
                      <div className="space-y-2 mt-2">
                        {PAYMENT_METHODS.map(method => (
                          <div key={method.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`payment-${method.value}`} 
                              checked={selectedPaymentMethods.includes(method.value)}
                              onCheckedChange={() => handlePaymentMethodChange(method.value)}
                            />
                            <label 
                              htmlFor={`payment-${method.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {method.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CNPJ filter */}
                    <div className="space-y-2">
                      <Label>Exige CNPJ?</Label>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                        {[
                          { label: 'Sim', value: 'true' },
                          { label: 'Não', value: 'false' },
                          { label: 'Ambos', value: null }
                        ].map(opt => (
                          <div key={opt.value || 'null'} className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id={`cnpj-${opt.value || 'all'}`} 
                              name="requires-cnpj"
                              value={opt.value || ''}
                              checked={requiresCnpj === opt.value}
                              onChange={() => setRequiresCnpj(opt.value)}
                              className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                            />
                            <Label htmlFor={`cnpj-${opt.value || 'all'}`} className="text-sm">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping methods filter */}
                    <div className="space-y-2">
                      <Label>Forma de envio</Label>
                      <div className="space-y-2 mt-2">
                        {SHIPPING_METHODS.map(method => (
                          <div key={method.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`shipping-${method.value}`} 
                              checked={selectedShippingMethods.includes(method.value)}
                              onCheckedChange={() => handleShippingMethodChange(method.value)}
                            />
                            <label 
                              htmlFor={`shipping-${method.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {method.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Website filter */}
                    <div className="space-y-2">
                      <Label>Tem site?</Label>
                       <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2">
                        {[
                          { label: 'Sim', value: 'true' },
                          { label: 'Não', value: 'false' },
                          { label: 'Ambos', value: null }
                        ].map(opt => (
                          <div key={opt.value || 'null-site'} className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id={`website-${opt.value || 'all'}`} 
                              name="has-website"
                              value={opt.value || ''}
                              checked={hasWebsite === opt.value}
                              onChange={() => setHasWebsite(opt.value)}
                              className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                            />
                            <Label htmlFor={`website-${opt.value || 'all'}`} className="text-sm">
                              {opt.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active filters badges */}
                  {activeFiltersCount > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <Label>Filtros ativos:</Label>
                      <div className="flex flex-wrap gap-2">
                        {categoryFilter !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Categoria: {allCategories.find(c => c.id === categoryFilter)?.name || categoryFilter}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setCategoryFilter('all')} />
                          </Badge>
                        )}
                        
                        {stateFilter !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Estado: {stateOptions.find(s => s.value === stateFilter)?.label || stateFilter}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setStateFilter('all')} />
                          </Badge>
                        )}

                        {cityFilter !== 'all' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Cidade: {cityOptions.find(c => c.value === cityFilter)?.label || cityFilter}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setCityFilter('all')} />
                          </Badge>
                        )}
                        
                        {(minOrderRange[0] > 0 || minOrderRange[1] < 1000) && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Pedido mín: {formatCurrency(minOrderRange[0])} - {formatCurrency(minOrderRange[1])}{minOrderRange[1] === 1000 && '+'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setMinOrderRange([0, 1000])} />
                          </Badge>
                        )}
                        
                        {selectedPaymentMethods.length > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Pagamento: {selectedPaymentMethods.map(pm => PAYMENT_METHODS.find(p => p.value === pm)?.label).join(', ')}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setSelectedPaymentMethods([])} />
                          </Badge>
                        )}
                        
                        {requiresCnpj !== null && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            CNPJ: {requiresCnpj === 'true' ? 'Exige' : 'Não exige'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setRequiresCnpj(null)} />
                          </Badge>
                        )}
                        
                        {selectedShippingMethods.length > 0 && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Envio: {selectedShippingMethods.map(sm => SHIPPING_METHODS.find(s => s.value === sm)?.label).join(', ')}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setSelectedShippingMethods([])} />
                          </Badge>
                        )}
                        
                        {hasWebsite !== null && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Site: {hasWebsite === 'true' ? 'Sim' : 'Não'}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setHasWebsite(null)} />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Results */}
            {(searchTerm || activeFiltersCount > 0) ? (
              <div className="mt-6">
                {(searchTerm && activeFiltersCount === 0) && (
                  <p className="text-muted-foreground mb-4">
                    Resultados para "{searchTerm}"
                  </p>
                )}
                {(searchTerm && activeFiltersCount > 0) && (
                  <p className="text-muted-foreground mb-4">
                    Resultados para "{searchTerm}" com {activeFiltersCount} filtro{activeFiltersCount === 1 ? "" : "s"} aplicado{activeFiltersCount === 1 ? "" : "s"}
                  </p>
                )}
                {(!searchTerm && activeFiltersCount > 0) && (
                    <p className="text-muted-foreground mb-4">
                        Resultados para {activeFiltersCount} filtro{activeFiltersCount === 1 ? "" : "s"} aplicado{activeFiltersCount === 1 ? "" : "s"}
                    </p>
                )}
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <p>Carregando fornecedores...</p>
                  </div>
                ) : error ? (
                  <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4 text-center">
                    <p className="text-destructive-foreground">
                      Erro ao carregar fornecedores: {error.message}. Tente novamente.
                    </p>
                  </div>
                ) : suppliers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(supplier => (
                      <Card key={supplier.id} className="overflow-hidden card-hover flex flex-col">
                        <Link to={`/suppliers/${supplier.id}`} className="block h-48 bg-accent">
                           <img 
                            src={supplier.images && supplier.images.length > 0 
                              ? supplier.images[0] 
                              : 'https://via.placeholder.com/300x200?text=Sem+imagem'}
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
                                  <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" titleAccess='Destaque' />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.state}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-500"
                              onClick={(e) => handleToggleFavorite(supplier, e)}
                              title={isFavorite(supplier.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                              <Heart 
                                className={`h-5 w-5 transition-colors ${isFavorite(supplier.id) ? "fill-red-500 text-red-500" : ""}`}
                              />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow min-h-[40px]">
                            {supplier.description || "Sem descrição disponível."}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {supplier.categories.slice(0, 3).map(categoryId => {
                               const category = allCategories.find(c => c.id === categoryId);
                               const categoryName = category ? category.name : categoryId;
                               const categoryColors: Record<string, string> = {
                                'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                                'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                                'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                                'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
                                'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                              };
                              
                              return (
                                <Badge 
                                  key={categoryId} 
                                  variant="outline"
                                  className={`text-xs ${categoryColors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                >
                                  {categoryName}
                                </Badge>
                              );
                            })}
                            {supplier.categories.length > 3 && (
                                <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    +{supplier.categories.length - 3}
                                </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                            <div>
                              <span className="font-medium text-foreground">Pedido mínimo:</span> {supplier.min_order || 'N/A'}
                            </div>
                            <div>
                               <span className="font-medium text-foreground">CNPJ:</span> {supplier.requires_cnpj ? 'Exige' : 'Não exige'}
                            </div>
                          </div>
                          
                          <div className="mt-auto flex flex-wrap gap-2">
                            {supplier.instagram && (
                              <Button size="sm" variant="outline" asChild className="text-xs">
                                <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                  <Instagram className="mr-1 h-3 w-3" />
                                  Instagram
                                </a>
                              </Button>
                            )}
                            
                            {supplier.website && (
                              <Button size="sm" variant="outline" asChild className="text-xs">
                                <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="mr-1 h-3 w-3" />
                                  Site
                                </a>
                              </Button>
                            )}
                            
                            <Button size="sm" asChild className="text-xs flex-1 sm:flex-none">
                              <Link to={`/suppliers/${supplier.id}`}>
                                Ver Detalhes
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-md border border-border bg-muted/30 p-8 text-center">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum resultado encontrado para sua busca.</p>
                    {(searchTerm || activeFiltersCount > 0) && (
                      <Button 
                        variant="link" 
                        onClick={resetFilters}
                        className="mt-2 text-primary"
                      >
                        Limpar busca e filtros
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-md border border-border bg-muted/30 p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Use a barra de pesquisa acima ou os filtros para encontrar fornecedores.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
