
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { toggleSupplierFeatured, toggleSupplierVisibility, deleteSupplierMutation } from '@/services/supplierService';
import type { Supplier } from '@/types';

export function useSuppliersManagementActions(refetch: () => void) {
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleToggleVisibility = async (supplier: Supplier) => {
    try {
      await toggleSupplierVisibility(supplier.id, !supplier.hidden);
      toast({
        title: "Visibilidade alterada",
        description: `${supplier.name} agora está ${supplier.hidden ? 'visível' : 'oculto'}.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a visibilidade do fornecedor.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (supplier: Supplier) => {
    try {
      await toggleSupplierFeatured(supplier.id, !supplier.featured);
      toast({
        title: "Destaque alterado",
        description: `${supplier.name} agora ${supplier.featured ? 'não está mais' : 'está'} em destaque.`,
      });
      refetch();
    } catch (error) {
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

    setIsDeleting(true);
    try {
      await deleteSupplierMutation(supplierToDelete.id);
      toast({
        title: "Fornecedor excluído",
        description: `${supplierToDelete.name} foi excluído permanentemente do sistema.`,
      });
      setSupplierToDelete(null);
      refetch();
      return supplierToDelete.id; // Return deleted supplier ID for cleanup
    } catch (error) {
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
