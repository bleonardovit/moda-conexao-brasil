
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface AdminSupplierFiltersProps {
  searchTerm: string;
  hiddenFilter: 'all' | 'visible' | 'hidden';
  featuredFilter: 'all' | 'featured' | 'normal';
  onSearchChange: (term: string) => void;
  onHiddenFilterChange: (filter: 'all' | 'visible' | 'hidden') => void;
  onFeaturedFilterChange: (filter: 'all' | 'featured' | 'normal') => void;
  onClearFilters: () => void;
  totalCount: number;
  isLoading?: boolean;
}

export function AdminSupplierFilters({
  searchTerm,
  hiddenFilter,
  featuredFilter,
  onSearchChange,
  onHiddenFilterChange,
  onFeaturedFilterChange,
  onClearFilters,
  totalCount,
  isLoading = false
}: AdminSupplierFiltersProps) {
  const hasActiveFilters = searchTerm || hiddenFilter !== 'all' || featuredFilter !== 'all';

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros de Fornecedores</h3>
        <div className="text-sm text-muted-foreground">
          {totalCount} fornecedor{totalCount !== 1 ? 'es' : ''} encontrado{totalCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, código ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        <Select
          value={hiddenFilter}
          onValueChange={onHiddenFilterChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="visible">Visíveis</SelectItem>
            <SelectItem value="hidden">Ocultos</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={featuredFilter}
          onValueChange={onFeaturedFilterChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Destaque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="featured">Em Destaque</SelectItem>
            <SelectItem value="normal">Normais</SelectItem>
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
