
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toggleSupplierFeatured, toggleSupplierVisibility, deleteSupplierMutation } from '@/services/supplierService';
import { sanitizeUUID, logUUIDError } from '@/utils/uuidValidation';
import type { Supplier } from '@/types';

export function useSuppliersManagementActions(refetch: () => void) {
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleToggleVisibility = async (supplier: Supplier) => {
    const supplierId = sanitizeUUID(supplier.id);
    if (!supplierId) {
      logUUIDError('handleToggleVisibility', supplier.id);
      toast({
        title: "Erro",
        description: "ID do fornecedor inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleSupplierVisibility(supplierId, !supplier.hidden);
      toast({
        title: "Visibilidade alterada",
        description: `${supplier.name} agora está ${supplier.hidden ? 'visível' : 'oculto'}.`,
      });
      refetch();
    } catch (error) {
      console.error('Error toggling supplier visibility:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a visibilidade do fornecedor.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (supplier: Supplier) => {
    const supplierId = sanitizeUUID(supplier.id);
    if (!supplierId) {
      logUUIDError('handleToggleFeatured', supplier.id);
      toast({
        title: "Erro",
        description: "ID do fornecedor inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      await toggleSupplierFeatured(supplierId, !supplier.featured);
      toast({
        title: "Destaque alterado",
        description: `${supplier.name} agora ${supplier.featured ? 'não está mais' : 'está'} em destaque.`,
      });
      refetch();
    } catch (error) {
      console.error('Error toggling supplier featured:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o destaque do fornecedor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    const supplierId = sanitizeUUID(supplierToDelete.id);
    if (!supplierId) {
      logUUIDError('confirmDelete', supplierToDelete.id);
      toast({
        title: "Erro",
        description: "ID do fornecedor inválido.",
        variant: "destructive",
      });
      return null;
    }

    setIsDeleting(true);
    try {
      await deleteSupplierMutation(supplierId);
      toast({
        title: "Fornecedor excluído",
        description: `${supplierToDelete.name} foi excluído permanentemente do sistema.`,
      });
      setSupplierToDelete(null);
      refetch();
      return supplierId;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o fornecedor. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    supplierToDelete,
    isDeleting,
    handleToggleVisibility,
    handleToggleFeatured,
    handleDeleteClick,
    confirmDelete,
    setSupplierToDelete
  };
}
