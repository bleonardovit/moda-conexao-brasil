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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Heart, Instagram, Link as LinkIcon, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { Link } from 'react-router-dom';
import type { Supplier, Category } from '@/types';
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
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 5]);
  const [hasWebsite, setHasWebsite] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<{[key: string]: boolean}>({});

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();

  // Fetch categories, states, and cities for filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch categories - assuming getCategories might need userId if RLS applies
        const categoriesData = await getCategories(userId);
        setAllCategories(categoriesData);
        const catOptions = [
          { label: 'Todas as Categorias', value: 'all' },
          ...categoriesData.map(cat => ({ label: cat.name, value: cat.id }))
        ];
        setCategoryOptions(catOptions);

        // Fetch all suppliers to derive states and cities
        const allSuppliersData = await getSuppliers(userId);
        
        const visibleSuppliers = allSuppliersData.filter(s => !s.hidden);

        const uniqueStates = Array.from(new Set(visibleSuppliers.map(s => s.state).filter(Boolean)));
        const stOptions = [
          { label: 'Todos os Estados', value: 'all' },
          ...uniqueStates.sort().map(st => ({ label: st, value: st }))
        ];
        setStateOptions(stOptions);

        const uniqueCities = Array.from(new Set(visibleSuppliers.map(s => s.city).filter(Boolean)));
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
  }, [toast, userId]);

  // Query suppliers from the database with filters
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers', searchTerm, categoryFilter, stateFilter, cityFilter, 
               minOrderRange, selectedPaymentMethods, requiresCnpj, 
               selectedShippingMethods, hasWebsite, userId], // Added userId to queryKey
    queryFn: async () => {
      try {
        return await searchSuppliers({
          searchTerm,
          categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
          state: stateFilter !== 'all' ? stateFilter : undefined,
          city: cityFilter !== 'all' ? cityFilter : undefined,
          minOrderRange,
          paymentMethods: selectedPaymentMethods,
          requiresCnpj: requiresCnpj !== null ? requiresCnpj === 'true' : null,
          shippingMethods: selectedShippingMethods,
          hasWebsite: hasWebsite !== null ? hasWebsite === 'true' : null
        }, userId);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
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
    setCategoryFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setMinOrderRange([0, 1000]);
    setSelectedPaymentMethods([]);
    setRequiresCnpj(null);
    setSelectedShippingMethods([]);
    setRatingRange([0, 5]);
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
    
    toggleFavorite(supplier.id);
    
    const action = isFavorite(supplier.id) ? 'removido dos' : 'adicionado aos';
    
    toast({
      title: isFavorite(supplier.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${supplier.name} foi ${action} seus favoritos`,
      duration: 2000,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">Pesquisar</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar fornecedores, produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
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
              {isLoading ? "Carregando..." : `${suppliers.length} resultados encontrados`}
            </span>
          </div>

          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent>
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
                      onValueChange={setStateFilter}
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
                    >
                      <SelectTrigger id="city">
                        <SelectValue placeholder="Selecione uma cidade" />
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
                      </span>
                    </div>
                    <Slider 
                      id="min-order"
                      defaultValue={[0, 1000]} 
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
                            className="text-sm"
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
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cnpj-yes" 
                          name="requires-cnpj"
                          checked={requiresCnpj === 'true'}
                          onChange={() => setRequiresCnpj('true')}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cnpj-yes" className="text-sm">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cnpj-no" 
                          name="requires-cnpj"
                          checked={requiresCnpj === 'false'}
                          onChange={() => setRequiresCnpj('false')}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cnpj-no" className="text-sm">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="cnpj-all" 
                          name="requires-cnpj"
                          checked={requiresCnpj === null}
                          onChange={() => setRequiresCnpj(null)}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cnpj-all" className="text-sm">Ambos</Label>
                      </div>
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
                            className="text-sm"
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
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="website-yes" 
                          name="has-website"
                          checked={hasWebsite === 'true'}
                          onChange={() => setHasWebsite('true')}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="website-yes" className="text-sm">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="website-no" 
                          name="has-website"
                          checked={hasWebsite === 'false'}
                          onChange={() => setHasWebsite('false')}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="website-no" className="text-sm">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          id="website-all" 
                          name="has-website"
                          checked={hasWebsite === null}
                          onChange={() => setHasWebsite(null)}
                          className="text-primary focus:ring-primary"
                        />
                        <Label htmlFor="website-all" className="text-sm">Ambos</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active filters badges */}
                {activeFiltersCount > 0 && (
                  <div className="space-y-2">
                    <Label>Filtros ativos</Label>
                    <div className="flex flex-wrap gap-2">
                      {categoryFilter !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Categoria: {allCategories.find(c => c.id === categoryFilter)?.name || categoryFilter}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
                        </Badge>
                      )}
                      
                      {stateFilter !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Estado: {stateOptions.find(s => s.value === stateFilter)?.label || stateFilter}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setStateFilter('all')} />
                        </Badge>
                      )}

                      {cityFilter !== 'all' && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Cidade: {cityOptions.find(c => c.value === cityFilter)?.label || cityFilter}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setCityFilter('all')} />
                        </Badge>
                      )}
                      
                      {(minOrderRange[0] > 0 || minOrderRange[1] < 1000) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Pedido mín: {formatCurrency(minOrderRange[0])} - {formatCurrency(minOrderRange[1])}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setMinOrderRange([0, 1000])} />
                        </Badge>
                      )}
                      
                      {selectedPaymentMethods.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Pagamento: {selectedPaymentMethods.map(pm => PAYMENT_METHODS.find(p => p.value === pm)?.label).join(', ')}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPaymentMethods([])} />
                        </Badge>
                      )}
                      
                      {requiresCnpj !== null && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          CNPJ: {requiresCnpj === 'true' ? 'Sim' : 'Não'}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setRequiresCnpj(null)} />
                        </Badge>
                      )}
                      
                      {selectedShippingMethods.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Envio: {selectedShippingMethods.map(sm => SHIPPING_METHODS.find(s => s.value === sm)?.label).join(', ')}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedShippingMethods([])} />
                        </Badge>
                      )}
                      
                      {hasWebsite !== null && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Site: {hasWebsite === 'true' ? 'Sim' : 'Não'}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => setHasWebsite(null)} />
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Results */}
          {searchTerm || activeFiltersCount > 0 ? (
            <div className="mt-6">
              {searchTerm && (
                <p className="text-muted-foreground mb-4">
                  Resultados para "{searchTerm}" 
                  {activeFiltersCount > 0 && ` com ${activeFiltersCount} filtros aplicados`}
                </p>
              )}
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando fornecedores...</p>
                </div>
              ) : error ? (
                <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-4 text-center">
                  <p className="text-destructive-foreground">Erro ao carregar fornecedores. Tente novamente.</p>
                </div>
              ) : suppliers.length > 0 ? (
                <div className="space-y-4">
                  {suppliers.map(supplier => (
                    <Card key={supplier.id} className="overflow-hidden card-hover">
                      <div className="sm:flex">
                        <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
                          <img 
                            src={supplier.images && supplier.images.length > 0 
                              ? supplier.images[0] 
                              : 'https://via.placeholder.com/300x200?text=Sem+imagem'}
                            alt={supplier.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="sm:w-2/3 md:w-3/4 p-4 flex flex-col">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold flex items-center">
                                <Link to={`/suppliers/${supplier.id}`} className="hover:underline">
                                  {supplier.name}
                                </Link>
                                {supplier.featured && (
                                  <Star className="ml-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">{supplier.city}, {supplier.state}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => handleToggleFavorite(supplier, e)}
                            >
                              <Heart 
                                className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                              />
                            </Button>
                          </div>
                          
                          <p className="text-sm mb-4 line-clamp-2 flex-grow min-h-[40px]">{supplier.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {supplier.categories.map(categoryId => {
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
                                  className={categoryColors[categoryName] || 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}
                                >
                                  {categoryName}
                                </Badge>
                              );
                            })}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div>
                              <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || 'Não informado'}
                            </div>
                            <div>
                              <span className="font-medium">
                                {supplier.requires_cnpj ? 'Exige CNPJ' : 'Não exige CNPJ'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-auto">
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
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-border p-8 text-center">
                  <p className="text-muted-foreground">Nenhum resultado encontrado para sua busca.</p>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="link" 
                      onClick={resetFilters}
                      className="mt-2"
                    >
                      Limpar filtros e tentar novamente
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-border p-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Use a barra de pesquisa acima ou os filtros para encontrar fornecedores.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
