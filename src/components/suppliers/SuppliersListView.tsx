
import { SupplierSearchAndActions } from '@/components/suppliers/SupplierSearchAndActions';
import { SupplierFilters } from '@/components/suppliers/SupplierFilters';
import { SupplierListVirtualized } from '@/components/suppliers/SupplierListVirtualized';
import { NoSuppliersFound } from '@/components/suppliers/NoSuppliersFound';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { PRICE_RANGES, CNPJ_OPTIONS } from '@/components/suppliers/SupplierFiltersConfig';
import { useSuppliersListLogic } from '@/hooks/useSuppliersListLogic';
import { useUnifiedPerformanceMonitor } from '@/hooks/useUnifiedPerformanceMonitor';
import { useOptimizedCache } from '@/hooks/useOptimizedCache';
import { useEffect } from 'react';
import type { Supplier } from '@/types';

// Componente de indicador de performance otimizado
function OptimizedPerformanceIndicator() {
  const { metrics } = useUnifiedPerformanceMonitor();
  const { metrics: cacheMetrics } = useOptimizedCache();
  
  if (metrics.totalQueries === 0) return null;

  const getHealthColor = () => {
    if (metrics.averageResponseTime < 500) return 'text-green-600';
    if (metrics.averageResponseTime < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="hidden md:block fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border rounded-lg p-3 text-xs space-y-1 shadow-lg">
      <div className="font-semibold text-gray-700">Performance</div>
      <div className={`${getHealthColor()}`}>
        Tempo médio: {metrics.averageResponseTime.toFixed(0)}ms
      </div>
      <div className="text-blue-600">
        Cache: {cacheMetrics.hitRate.toFixed(1)}% hits
      </div>
      <div className="text-gray-600">
        Queries: {metrics.totalQueries} | Lentas: {metrics.slowQueries}
      </div>
      {metrics.errorRate > 0 && (
        <div className="text-red-600">
          Erros: {metrics.errorRate.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export function SuppliersListView() {
  const { invalidate } = useOptimizedCache();
  const { recordQuery } = useUnifiedPerformanceMonitor();
  
  const {
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
  } = useSuppliersListLogic();

  // Monitor de performance para filtros
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      recordQuery('suppliers-filters-render', duration, true);
    };
  }, [searchTerm, categoryFilter, stateFilter, cityFilter, priceFilter, cnpjFilter, recordQuery]);

  // Invalidar cache quando favoritos mudam
  const handleToggleFavoriteOptimized = async (supplier: Supplier, e: React.MouseEvent) => {
    const startTime = performance.now();
    
    try {
      // Create a mock event to pass to the original handler
      const mockEvent = e || { preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent;
      await handleToggleFavorite(supplier, mockEvent);
      invalidate('favorites');
      invalidate('suppliers');
      
      const duration = performance.now() - startTime;
      recordQuery('toggle-favorite', duration, true);
    } catch (error) {
      const duration = performance.now() - startTime;
      recordQuery('toggle-favorite', duration, false, (error as Error).message);
      throw error;
    }
  };

  // Limpar filtros otimizado
  const handleClearAllFilters = () => {
    const startTime = performance.now();
    
    clearAllFilters();
    invalidate('suppliers');
    
    const duration = performance.now() - startTime;
    recordQuery('clear-filters', duration, true);
  };

  if (filtersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando filtros...</p>
        </div>
      </div>
    );
  }

  return (
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

      {paginatedSuppliers.length === 0 && !isLoading ? (
        <NoSuppliersFound onClearFilters={handleClearAllFilters} />
      ) : (
        <SupplierListVirtualized
          suppliers={paginatedSuppliers}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavoriteOptimized}
          getCategoryName={getCategoryName}
          getCategoryStyle={getCategoryStyle}
          formatAvgPrice={formatAvgPrice}
          fetchNextPage={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isLoading={isLoading || isFetchingNextPage}
        />
      )}

      <OptimizedPerformanceIndicator />
    </div>
  );
}
