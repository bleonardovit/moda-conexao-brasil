
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

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  supplier: Supplier | null;
  isDeleting?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  supplier,
  isDeleting = false
}: ConfirmDeleteDialogProps) {
  if (!supplier) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o fornecedor <strong>{supplier.name}</strong> (Código: {supplier.code})?
            </p>
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-1">⚠️ Esta ação é irreversível!</p>
              <p className="text-sm text-muted-foreground">
                Todos os dados relacionados serão permanentemente removidos:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                <li>Informações do fornecedor</li>
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
            {isDeleting ? 'Excluindo...' : 'Excluir Permanentemente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
