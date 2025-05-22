
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Heart } from 'lucide-react';

interface SupplierSearchAndActionsProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  showOnlyFavorites: boolean;
  onToggleShowOnlyFavorites: () => void;
  isFilterOpen: boolean;
  onToggleFilterOpen: () => void;
  filteredSuppliersCount: number;
}

export function SupplierSearchAndActions({
  searchTerm,
  onSearchTermChange,
  showOnlyFavorites,
  onToggleShowOnlyFavorites,
  isFilterOpen,
  onToggleFilterOpen,
  filteredSuppliersCount,
}: SupplierSearchAndActionsProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleShowOnlyFavorites}
          className={showOnlyFavorites ? "bg-accent text-accent-foreground" : ""}
        >
          <Heart className={`mr-2 h-4 w-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
          Favoritos
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar fornecedor..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilterOpen}
          className={isFilterOpen ? "bg-accent text-accent-foreground" : ""}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {isFilterOpen ? " (ativos)" : ""}
        </Button>
        <span className="text-sm text-muted-foreground">
          {filteredSuppliersCount} fornecedores encontrados
        </span>
      </div>
    </>
  );
}
