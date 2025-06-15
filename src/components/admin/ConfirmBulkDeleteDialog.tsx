
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import type { Supplier } from '@/types';

interface ConfirmBulkDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suppliers: Supplier[];
  isDeleting?: boolean;
}

export function ConfirmBulkDeleteDialog({
  open,
  onClose,
  onConfirm,
  suppliers,
  isDeleting = false
}: ConfirmBulkDeleteDialogProps) {
  const count = suppliers.length;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Confirmar Exclusão em Massa</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Tem certeza que deseja excluir <strong>{count} fornecedor{count !== 1 ? 'es' : ''}</strong>?
            </p>
            
            {count <= 5 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Fornecedores selecionados:</p>
                <ul className="text-sm space-y-1">
                  {suppliers.map(supplier => (
                    <li key={supplier.id} className="flex justify-between">
                      <span>{supplier.name}</span>
                      <span className="text-muted-foreground">({supplier.code})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-1">⚠️ Esta ação é irreversível!</p>
              <p className="text-sm text-muted-foreground">
                Todos os dados relacionados de {count} fornecedor{count !== 1 ? 'es' : ''} serão permanentemente removidos:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                <li>Informações dos fornecedores</li>
                <li>Categorias associadas</li>
                <li>Favoritos dos usuários</li>
                <li>Avaliações e comentários</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? `Excluindo ${count} fornecedor${count !== 1 ? 'es' : ''}...` : `Excluir ${count} Fornecedor${count !== 1 ? 'es' : ''}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
