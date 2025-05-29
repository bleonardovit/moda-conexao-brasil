import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { searchSuppliers, getDistinctCities, getDistinctStates } from '@/services/supplierService';
import { getCategories as fetchSupplierCategories } from '@/services/categoryService'; // Renamed to avoid conflict
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, Filter as FilterIcon, X, Loader2 } from 'lucide-react'; // Added Loader2
import { useTrialStatus } from '@/hooks/use-trial-status';
import { useAuth } from '@/hooks/useAuth';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { FeatureLimitedAccess } from '@/components/trial/FeatureLimitedAccess'; // Import FeatureLimitedAccess
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import type { Category as SupplierCategoryType, Supplier, PaymentMethod, ShippingMethod } from '@/types';
import { brazilianStates } from '@/data/brazilian-states';

interface Option {
  label: string;
  value: string;
}

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'card', label: 'Cartão' },
  { value: 'bankslip', label: 'Boleto' },
];

const shippingMethodOptions: { value: ShippingMethod; label: string }[] = [
  { value: 'correios', label: 'Correios' },
  { value: 'transporter', label: 'Transportadora' },
  { value: 'delivery', label: 'Entrega local' }, // Mapped 'Entrega local' to 'delivery'
];


const SearchPage = () => {
  const [supplierCategories, setSupplierCategories] = useState<SupplierCategoryType[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isInTrial, isFeatureAllowed, hasExpired } = useTrialStatus();
  const { user } = useAuth();
  const [isPageAccessible, setIsPageAccessible] = useState<boolean | null>(null);
  const [accessDenialReason, setAccessDenialReason] = useState<'expired' | 'limited_trial' | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [minOrderMin, setMinOrderMin] = useState('');
  const [minOrderMax, setMinOrderMax] = useState('');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [requiresCnpjFilter, setRequiresCnpjFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [selectedShippingMethods, setSelectedShippingMethods] = useState<ShippingMethod[]>([]);
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState<'all' | 'yes' | 'no'>('all');
  
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [availableCities, setAvailableCities] = useState<Option[]>([]);

  useEffect(() => {
    const determineAccess = async () => {
      if (hasExpired) {
        setIsPageAccessible(false);
        setAccessDenialReason('expired');
      } else if (isInTrial) {
        const access = await isFeatureAllowed('advanced_search');
        setIsPageAccessible(access);
        if (!access) {
          setAccessDenialReason('limited_trial');
        } else {
          setAccessDenialReason(null);
        }
      } else { // Not in trial (e.g., subscribed or never started/converted)
        setIsPageAccessible(true);
        setAccessDenialReason(null);
      }
    };
    determineAccess();
  }, [hasExpired, isInTrial, isFeatureAllowed]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (isPageAccessible === false || isPageAccessible === null) return; // Don't fetch if not accessible or access not determined yet
      try {
        const categoriesData = await fetchSupplierCategories();
        setSupplierCategories(categoriesData);
        
        const citiesData = await getDistinctCities();
        const validCities = citiesData.filter(city => city && city.trim() !== '');
        setAvailableCities(validCities.map(city => ({ label: city, value: city })).sort((a,b) => a.label.localeCompare(b.label)));

      } catch (error) {
        console.error('Error fetching initial filter data:', error);
      }
    };
    // Only run if page is accessible
    if (isPageAccessible) {
        fetchInitialData();
    }
  }, [isPageAccessible]);
  
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setSelectedShippingMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleSearch = useCallback(async () => {
    if (!isPageAccessible) return; // Should not be callable if page not accessible
    setIsLoading(true);
    try {
      const filters: import('@/types').SearchFilters = {
        searchTerm: searchTerm.trim() || undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        state: stateFilter !== 'all' ? stateFilter : undefined,
        city: cityFilter !== 'all' ? cityFilter.trim() : undefined,
        minOrderMin: minOrderMin !== '' ? parseInt(minOrderMin, 10) : undefined,
        minOrderMax: minOrderMax !== '' ? parseInt(minOrderMax, 10) : undefined,
        paymentMethods: selectedPaymentMethods.length > 0 ? selectedPaymentMethods : undefined,
        requiresCnpj: requiresCnpjFilter === 'yes' ? true : requiresCnpjFilter === 'no' ? false : null,
        shippingMethods: selectedShippingMethods.length > 0 ? selectedShippingMethods : undefined,
        hasWebsite: hasWebsiteFilter === 'yes' ? true : hasWebsiteFilter === 'no' ? false : null,
      };
      const results = await searchSuppliers(filters);
      setSuppliers(results);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, stateFilter, cityFilter, minOrderMin, minOrderMax, selectedPaymentMethods, requiresCnpjFilter, selectedShippingMethods, hasWebsiteFilter, isPageAccessible]);

  useEffect(() => {
    // Auto-search if not initial load and some filter changes, or searchTerm changes
    // For now, rely on manual search button click to avoid too many requests
    // handleSearch(); // Debounce or make this explicit
  }, [handleSearch]);

  const clearFilters = () => {
    setCategoryFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setMinOrderMin('');
    setMinOrderMax('');
    setSelectedPaymentMethods([]);
    setRequiresCnpjFilter('all');
    setSelectedShippingMethods([]);
    setHasWebsiteFilter('all');
  };

  if (isPageAccessible === null) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          <p className="ml-2 text-muted-foreground">Verificando acesso...</p>
        </div>
      </AppLayout>
    );
  }

  if (isPageAccessible === false) {
    const title = accessDenialReason === 'expired' 
      ? "Teste Gratuito Expirado" 
      : "Acesso Restrito à Busca Avançada";
    
    const message = accessDenialReason === 'expired'
      ? "Seu período de teste gratuito expirou. Assine um plano para continuar utilizando a busca avançada e ter acesso completo aos detalhes dos fornecedores."
      : "A busca avançada é uma funcionalidade premium. Assine um plano ou, se aplicável, atualize seu plano para desbloquear todos os filtros e funcionalidades.";

    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <TrialBanner />
          <FeatureLimitedAccess
            title={title}
            message={message}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Pesquisar Fornecedores</h1>
          <Button variant="outline" onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="w-full sm:w-auto">
            <FilterIcon className="mr-2 h-4 w-4" />
            {isFilterPanelOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'} ({suppliers.length > 0 ? `${suppliers.length} resultados` : 'Use os filtros'})
          </Button>
        </div>
        
        <TrialBanner /> {/* Consider placement or conditional rendering based on context */}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar fornecedores, produtos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 w-full"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>

        {isFilterPanelOpen && (
          <Card className="p-4 sm:p-6">
            <CardContent className="p-0 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Refinar busca</h2>
                <Button variant="link" onClick={clearFilters} className="text-sm">
                  <X className="mr-1 h-3 w-3" />
                  Limpar filtros
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Category Filter */}
                <div className="space-y-1">
                  <Label htmlFor="category-filter">Categoria</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter} name="category-filter">
                    <SelectTrigger> <SelectValue placeholder="Todas as categorias" /> </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {supplierCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-1">
                  <Label htmlFor="state-filter">Estado</Label>
                  <Select value={stateFilter} onValueChange={setStateFilter} name="state-filter">
                    <SelectTrigger> <SelectValue placeholder="Todos os estados" /> </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os estados</SelectItem>
                      {brazilianStates.map(state => (
                        <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter - Using Select, populated by distinct cities */}
                <div className="space-y-1">
                  <Label htmlFor="city-filter">Cidade</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter} name="city-filter">
                    <SelectTrigger> <SelectValue placeholder="Todas as cidades" /> </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {availableCities.map(city => (
                        <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Order Filter */}
                <div className="md:col-span-1 space-y-1">
                  <Label>Pedido Mínimo (R$)</Label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Mín." value={minOrderMin} onChange={e => setMinOrderMin(e.target.value)} />
                    <Input type="number" placeholder="Máx." value={minOrderMax} onChange={e => setMinOrderMax(e.target.value)} />
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <div className="space-y-1">
                    {paymentMethodOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`payment-${option.value}`}
                          checked={selectedPaymentMethods.includes(option.value)}
                          onCheckedChange={() => handlePaymentMethodChange(option.value)}
                        />
                        <Label htmlFor={`payment-${option.value}`} className="font-normal">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requires CNPJ */}
                <div className="space-y-2">
                  <Label>Exige CNPJ?</Label>
                  <RadioGroup value={requiresCnpjFilter} onValueChange={(v: any) => setRequiresCnpjFilter(v as 'all' | 'yes' | 'no')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="cnpj-all" /><Label htmlFor="cnpj-all" className="font-normal">Ambos</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="cnpj-yes" /><Label htmlFor="cnpj-yes" className="font-normal">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="cnpj-no" /><Label htmlFor="cnpj-no" className="font-normal">Não</Label></div>
                  </RadioGroup>
                </div>

                {/* Shipping Methods */}
                <div className="space-y-2">
                  <Label>Forma de Envio</Label>
                  <div className="space-y-1">
                    {shippingMethodOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`shipping-${option.value}`}
                          checked={selectedShippingMethods.includes(option.value)}
                          onCheckedChange={() => handleShippingMethodChange(option.value)}
                        />
                        <Label htmlFor={`shipping-${option.value}`} className="font-normal">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Has Website */}
                <div className="space-y-2">
                  <Label>Tem site?</Label>
                  <RadioGroup value={hasWebsiteFilter} onValueChange={(v: any) => setHasWebsiteFilter(v as 'all' | 'yes' | 'no')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="website-all" /><Label htmlFor="website-all" className="font-normal">Ambos</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="website-yes" /><Label htmlFor="website-yes" className="font-normal">Sim</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="website-no" /><Label htmlFor="website-no" className="font-normal">Não</Label></div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
            <p className="ml-2 text-muted-foreground">Carregando resultados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.length > 0 ? (
              suppliers.map(supplier => (
                <Card key={supplier.id} className="overflow-hidden card-hover hover:shadow-lg transition-shadow">
                  <div className="sm:flex">
                    <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent flex-shrink-0">
                      <img
                        src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
                        alt={supplier.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="sm:w-2/3 md:w-3/4 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.state}</p>
                        <p className="text-sm mt-2 line-clamp-2">{supplier.isLockedForTrial ? "Detalhes disponíveis apenas para assinantes." : supplier.description}</p>
                      </div>
                      <div className="mt-4">
                        {supplier.isLockedForTrial ? (
                           <Button size="sm" variant="outline" disabled className="bg-gray-100 border-gray-300 text-gray-500">
                             Ver detalhes (Bloqueado)
                           </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline" className="bg-brand-purple/10 hover:bg-brand-purple/20 border-brand-purple/30">
                            <Link to={`/suppliers/${supplier.id}`}>Ver detalhes</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum fornecedor encontrado com os critérios selecionados. Tente ajustar seus filtros ou o termo de busca.</p>
                { (searchTerm || categoryFilter !== 'all' || stateFilter !== 'all' || cityFilter !== 'all' || minOrderMin || minOrderMax || selectedPaymentMethods.length > 0 || requiresCnpjFilter !== 'all' || selectedShippingMethods.length > 0 || hasWebsiteFilter !== 'all') &&
                  <Button variant="link" onClick={() => { clearFilters(); handleSearch(); }} className="mt-2">Limpar filtros e buscar novamente</Button>
                }
              </div>
            )}
            {suppliers.length === 0 && !searchTerm && categoryFilter === 'all' && stateFilter === 'all' && cityFilter === 'all' && !minOrderMin && !minOrderMax && selectedPaymentMethods.length === 0 && requiresCnpjFilter === 'all' && selectedShippingMethods.length === 0 && hasWebsiteFilter === 'all' && (
                 <div className="text-center py-12 text-muted-foreground">
                    Digite algo na busca ou utilize os filtros para encontrar fornecedores.
                 </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
