
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/use-favorites';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { useToast } from "@/hooks/use-toast";
import type { Supplier, Category } from '@/types';
import { getSuppliers } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';
import { useTrialStatus } from '@/hooks/use-trial-status';

import { SupplierSearchAndActions } from '@/components/suppliers/SupplierSearchAndActions';
import { SupplierFilters } from '@/components/suppliers/SupplierFilters';
import { NoSuppliersFound } from '@/components/suppliers/NoSuppliersFound';
import { useInfiniteSuppliers } from '@/hooks/useInfiniteSuppliers';
import { SupplierListVirtualized } from '@/components/suppliers/SupplierListVirtualized';

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
  const { isInTrial, allowedSupplierIds } = useTrialStatus();

  // Corrigido: variáveis para loading só dos filtros
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{
    label: string;
    value: string;
  }[]>([{
    label: 'Todas as Categorias',
    value: 'all'
  }]);
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

  // Correção do carregamento dos filtros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFiltersLoading(true);
        const [suppliersData, categoriesData] = await Promise.all([
          getSuppliers(user?.id), // getSuppliers já filtra fornecedores ocultos
          getCategories()
        ]);

        setCategories(categoriesData);
        setCategoryOptions([{
          label: 'Todas as Categorias',
          value: 'all'
        },
        ...categoriesData.map(cat => ({
          label: cat.name,
          value: cat.id
        }))]);

        const uniqueStates = Array.from(new Set(suppliersData.map(s => s.state))).filter(Boolean);
        setStateOptions([{
          label: 'Todos os Estados',
          value: 'all'
        }, ...uniqueStates.map(st => ({
          label: st,
          value: st
        }))]);

        const uniqueCities = Array.from(new Set(suppliersData.map(s => s.city))).filter(Boolean);
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
        setFiltersLoading(false);
      }
    };
    fetchData();
  }, [toast, user?.id]);

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
    // We need to check the state *before* toggling to determine the correct message
    const currentlyFavorite = isFavorite(supplier.id);
    toggleFavorite(supplier.id); // This will change the favorite state
    const action = currentlyFavorite ? 'removido dos' : 'adicionado aos';
    toast({
      title: currentlyFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${supplier.name} foi ${action} seus favoritos.`,
      duration: 2000
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

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
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setPriceFilter('all');
    setCnpjFilter('all');
    setShowOnlyFavorites(false);
  };

  // Novo hook de paginação virtualizada
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteSuppliers({
    userId: user?.id,
    filters: {
      searchTerm,
      category: categoryFilter,
      state: stateFilter,
      city: cityFilter,
      price: priceFilter,
      cnpj: cnpjFilter,
      favorites: showOnlyFavorites ? favorites : undefined,
    }
  });

  // Flat suppliers list for display
  // data.pages será do tipo { items: Supplier[]; hasMore: boolean }[]
  const paginatedSuppliers = data ? data.pages.flatMap((page) => page.items) : [];

  if (filtersLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando fornecedores...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <SupplierSearchAndActions
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          showOnlyFavorites={showOnlyFavorites}
          onToggleShowOnlyFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
          isFilterOpen={isFilterOpen}
          onToggleFilterOpen={() => setIsFilterOpen(!isFilterOpen)}
          filteredSuppliersCount={paginatedSuppliers.length}
        />

        <TrialBanner />

        {isFilterOpen && (
          <SupplierFilters
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            stateFilter={stateFilter}
            onStateFilterChange={setStateFilter}
            cityFilter={cityFilter}
            onCityFilterChange={setCityFilter}
            priceFilter={priceFilter}
            onPriceFilterChange={setPriceFilter}
            cnpjFilter={cnpjFilter}
            onCnpjFilterChange={setCnpjFilter}
            categoryOptions={categoryOptions}
            stateOptions={stateOptions}
            cityOptions={cityOptions}
            priceRanges={PRICE_RANGES}
            cnpjOptions={CNPJ_OPTIONS}
          />
        )}

        <SupplierListVirtualized
          suppliers={paginatedSuppliers}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          getCategoryName={getCategoryName}
          getCategoryStyle={getCategoryStyle}
          formatAvgPrice={formatAvgPrice}
          fetchNextPage={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isLoading={isLoading || isFetchingNextPage}
        />
      </div>
    </AppLayout>
  );
}
