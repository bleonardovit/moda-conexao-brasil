
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
  label: string;
  value: string;
}

interface SupplierFiltersProps {
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  stateFilter: string;
  onStateFilterChange: (value: string) => void;
  cityFilter: string;
  onCityFilterChange: (value: string) => void;
  priceFilter: string;
  onPriceFilterChange: (value: string) => void;
  cnpjFilter: string;
  onCnpjFilterChange: (value: string) => void;
  categoryOptions: Option[];
  stateOptions: Option[];
  cityOptions: Option[];
  priceRanges: Option[];
  cnpjOptions: Option[];
}

export function SupplierFilters({
  categoryFilter,
  onCategoryFilterChange,
  stateFilter,
  onStateFilterChange,
  cityFilter,
  onCityFilterChange,
  priceFilter,
  onPriceFilterChange,
  cnpjFilter,
  onCnpjFilterChange,
  categoryOptions,
  stateOptions,
  cityOptions,
  priceRanges,
  cnpjOptions,
}: SupplierFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-md">
      <div className="space-y-2">
        <label className="text-sm font-medium">Categoria</label>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Estado</label>
        <Select value={stateFilter} onValueChange={onStateFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            {stateOptions.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cidade</label>
        <Select value={cityFilter} onValueChange={onCityFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma cidade" />
          </SelectTrigger>
          <SelectContent>
            {cityOptions.map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Faixa de Preço</label>
        <Select value={priceFilter} onValueChange={onPriceFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma faixa" />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((price) => (
              <SelectItem key={price.value} value={price.value}>
                {price.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Requisito CNPJ</label>
        <Select value={cnpjFilter} onValueChange={onCnpjFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Requisito CNPJ" />
          </SelectTrigger>
          <SelectContent>
            {cnpjOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
