
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from "@/hooks/use-toast";
import type { Supplier, Category } from '@/types';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';
import { getDistinctCitiesOptimized, getDistinctStatesOptimized } from '@/services/supplier/optimizedFilters';
import { useInfiniteSuppliers } from '@/hooks/useInfiniteSuppliers';
import { DEFAULT_FILTER_OPTIONS } from '@/components/suppliers/SupplierFiltersConfig';

export function useSuppliersListLogic() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [cnpjFilter, setCnpjFilter] = useState('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados para opções de filtro
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_FILTER_OPTIONS.categories);
  const [stateOptions, setStateOptions] = useState(DEFAULT_FILTER_OPTIONS.states);
  const [cityOptions, setCityOptions] = useState(DEFAULT_FILTER_OPTIONS.cities);

  // Debounced search term para evitar queries desnecessárias
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoizar filtros para evitar re-renders desnecessários
  const filters = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    category: categoryFilter,
    state: stateFilter,
    city: cityFilter,
    price: priceFilter,
    cnpj: cnpjFilter,
    favorites: showOnlyFavorites ? favorites : undefined,
  }), [debouncedSearchTerm, categoryFilter, stateFilter, cityFilter, priceFilter, cnpjFilter, showOnlyFavorites, favorites]);

  // Carregar opções de filtro usando as funções otimizadas
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFiltersLoading(true);
        const [categoriesData, statesData, citiesData] = await Promise.all([
          getCategories(),
          getDistinctStatesOptimized(),
          getDistinctCitiesOptimized()
        ]);

        setCategories(categoriesData);
        setCategoryOptions([
          ...DEFAULT_FILTER_OPTIONS.categories,
          ...categoriesData.map(cat => ({ label: cat.name, value: cat.id }))
        ]);

        setStateOptions([
          ...DEFAULT_FILTER_OPTIONS.states,
          ...statesData.map(state => ({ label: state, value: state }))
        ]);

        setCityOptions([
          ...DEFAULT_FILTER_OPTIONS.cities,
          ...citiesData.map(city => ({ label: city, value: city }))
        ]);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        toast({
          title: "Erro ao carregar filtros",
          description: "Não foi possível carregar as opções de filtros. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilterOptions();
  }, [toast]);

  // Helper functions memoizadas
  const formatAvgPrice = useCallback((price: string) => {
    switch (price) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Não informado';
    }
  }, []);

  const handleToggleFavorite = useCallback((supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentlyFavorite = isFavorite(supplier.id);
    toggleFavorite(supplier.id);
    const action = currentlyFavorite ? 'removido dos' : 'adicionado aos';
    toast({
      title: currentlyFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${supplier.name} foi ${action} seus favoritos.`,
      duration: 2000
    });
  }, [isFavorite, toggleFavorite, toast]);

  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }, [categories]);

  const getCategoryStyle = useCallback((categoryName: string) => {
    const categoryColors: Record<string, string> = {
      'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return categoryColors[categoryName] || '';
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setPriceFilter('all');
    setCnpjFilter('all');
    setShowOnlyFavorites(false);
  }, []);

  // Hook otimizado de paginação com nova função SQL
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteSuppliers({
    userId: user?.id,
    filters
  });

  // Suppliers otimizados vindos do backend
  const paginatedSuppliers = useMemo(() => 
    data ? data.pages.flatMap((page) => page.items) : []
  , [data]);

  return {
    // Filter states
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stateFilter,
    setStateFilter,
    cityFilter,
    setCityFilter,
    priceFilter,
    setPriceFilter,
    cnpjFilter,
    setCnpjFilter,
    showOnlyFavorites,
    setShowOnlyFavorites,
    isFilterOpen,
    setIsFilterOpen,
    
    // Filter options
    filtersLoading,
    categoryOptions,
    stateOptions,
    cityOptions,
    
    // Data and helpers
    paginatedSuppliers,
    isFavorite,
    handleToggleFavorite,
    getCategoryName,
    getCategoryStyle,
    formatAvgPrice,
    clearAllFilters,
    
    // Infinite query
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}
