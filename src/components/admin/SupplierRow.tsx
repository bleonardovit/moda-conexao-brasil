
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Star, StarOff, Edit, Trash2 } from 'lucide-react';
import { SupplierFormModal } from './SupplierFormModal';
import type { Supplier } from '@/types';

interface SupplierRowProps {
  supplier: Supplier;
  isSelected: boolean;
  onSelect: (supplier: Supplier, checked: boolean) => void;
  onToggleVisibility: (supplier: Supplier) => void;
  onToggleFeatured: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export function SupplierRow({
  supplier,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleFeatured,
  onDelete,
  onRefresh
}: SupplierRowProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatAvgPrice = (price: string) => {
    const priceMap = {
      'low': 'Baixo',
      'medium': 'Médio', 
      'high': 'Alto'
    };
    return priceMap[price as keyof typeof priceMap] || 'N/A';
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    onRefresh();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(supplier, checked as boolean)}
            aria-label={`Selecionar ${supplier.name}`}
          />
        </TableCell>
        <TableCell className="font-mono text-sm">{supplier.code}</TableCell>
        <TableCell className="font-medium">{supplier.name}</TableCell>
        <TableCell>{supplier.city}, {supplier.state}</TableCell>
        <TableCell>{formatAvgPrice(supplier.avg_price)}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Badge variant={supplier.hidden ? "destructive" : "default"}>
              {supplier.hidden ? "Oculto" : "Visível"}
            </Badge>
            {supplier.featured && (
              <Badge variant="secondary">Destaque</Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          {supplier.averageRating ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{supplier.averageRating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Sem avaliações</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(supplier)}
              title={supplier.hidden ? "Mostrar fornecedor" : "Ocultar fornecedor"}
            >
              {supplier.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFeatured(supplier)}
              title={supplier.featured ? "Remover destaque" : "Destacar fornecedor"}
            >
              {supplier.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              title="Editar fornecedor"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(supplier)}
              title="Excluir fornecedor"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <SupplierFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={supplier}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
