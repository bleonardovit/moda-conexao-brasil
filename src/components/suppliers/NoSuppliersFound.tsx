
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoSuppliersFoundProps {
  onClearFilters: () => void;
}

export function NoSuppliersFound({ onClearFilters }: NoSuppliersFoundProps) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">Nenhum fornecedor encontrado com os filtros selecionados.</p>
      <Button variant="link" onClick={onClearFilters}>
        Limpar filtros
      </Button>
    </div>
  );
}
