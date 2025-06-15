
import React, { useRef } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { SupplierRow } from './SupplierRow';
import type { Supplier } from '@/types';

interface SuppliersTableProps {
  suppliers: Supplier[];
  selectedSuppliers: Supplier[];
  onSelectAll: (checked: boolean) => void;
  onSelectSupplier: (supplier: Supplier, checked: boolean) => void;
  onToggleVisibility: (supplier: Supplier) => void;
  onToggleFeatured: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export function SuppliersTable({
  suppliers,
  selectedSuppliers,
  onSelectAll,
  onSelectSupplier,
  onToggleVisibility,
  onToggleFeatured,
  onDeleteSupplier,
  onRefresh
}: SuppliersTableProps) {
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

  const allSelected = suppliers.length > 0 && selectedSuppliers.length === suppliers.length;
  const someSelected = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length;

  const isSupplierSelected = (supplierId: string) => {
    return selectedSuppliers.some(s => s.id === supplierId);
  };

  // Set indeterminate state for select all checkbox
  if (selectAllCheckboxRef.current) {
    const checkboxElement = selectAllCheckboxRef.current.querySelector('button');
    if (checkboxElement) {
      (checkboxElement as any).indeterminate = someSelected;
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              ref={selectAllCheckboxRef}
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Selecionar todos"
            />
          </TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Preço Médio</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Avaliação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <SupplierRow
            key={supplier.id}
            supplier={supplier}
            isSelected={isSupplierSelected(supplier.id)}
            onSelect={onSelectSupplier}
            onToggleVisibility={onToggleVisibility}
            onToggleFeatured={onToggleFeatured}
            onDelete={onDeleteSupplier}
            onRefresh={onRefresh}
          />
        ))}
      </TableBody>
    </Table>
  );
}
