
import { SupplierSearchAndActions } from '@/components/suppliers/SupplierSearchAndActions';
import { SupplierFilters } from '@/components/suppliers/SupplierFilters';
import { SupplierListVirtualized } from '@/components/suppliers/SupplierListVirtualized';
import { NoSuppliersFound } from '@/components/suppliers/NoSuppliersFound';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { PRICE_RANGES, CNPJ_OPTIONS } from '@/components/suppliers/SupplierFiltersConfig';
import { useSuppliersListLogic } from '@/hooks/useSuppliersListLogic';

export function SuppliersListView() {
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
        <NoSuppliersFound onClearFilters={clearAllFilters} />
      ) : (
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
      )}
    </div>
  );
}
