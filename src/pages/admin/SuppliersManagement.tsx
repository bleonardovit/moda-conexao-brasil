
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminSuppliersPagination } from '@/hooks/useAdminSuppliersPagination';
import { useSuppliersManagementActions } from '@/hooks/useSuppliersManagementActions';
import { AdminSupplierFilters } from '@/components/admin/AdminSupplierFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminBulkOperations } from '@/components/admin/AdminBulkOperations';
import { SuppliersTable } from '@/components/admin/SuppliersTable';
import { SupplierFormModal } from '@/components/admin/SupplierFormModal';
import { ConfirmDeleteDialog } from '@/components/admin/ConfirmDeleteDialog';
import { Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import type { Supplier } from '@/types';

export default function SuppliersManagement() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    suppliers,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    hiddenFilter,
    featuredFilter,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    setHiddenFilter,
    setFeaturedFilter,
    clearFilters,
    refetch,
  } = useAdminSuppliersPagination();

  const {
    supplierToDelete,
    isDeleting,
    handleToggleVisibility,
    handleToggleFeatured,
    handleDeleteClick,
    confirmDelete,
    setSupplierToDelete
  } = useSuppliersManagementActions(refetch);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(suppliers);
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (supplier: Supplier, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(prev => [...prev, supplier]);
    } else {
      setSelectedSuppliers(prev => prev.filter(s => s.id !== supplier.id));
    }
  };

  const handleConfirmDelete = async () => {
    const deletedSupplierId = await confirmDelete();
    if (deletedSupplierId) {
      // Clear selection if deleted supplier was selected
      setSelectedSuppliers(prev => prev.filter(s => s.id !== deletedSupplierId));
    }
  };

  const handleAddSuccess = () => {
    refetch();
    setIsAddModalOpen(false);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Gerenciar Fornecedores | Admin Os Fornecedores</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerenciar Fornecedores</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fornecedor
            </Button>
            <Link to="/admin/suppliers/bulk-upload">
              <Button variant="outline">Importar Fornecedores</Button>
            </Link>
          </div>
        </div>

        <AdminSupplierFilters
          searchTerm={searchTerm}
          hiddenFilter={hiddenFilter}
          featuredFilter={featuredFilter}
          onSearchChange={handleSearch}
          onHiddenFilterChange={setHiddenFilter}
          onFeaturedFilterChange={setFeaturedFilter}
          onClearFilters={clearFilters}
          totalCount={totalCount}
          isLoading={isLoading}
        />

        <AdminBulkOperations
          selectedSuppliers={selectedSuppliers}
          onOperationComplete={() => {
            refetch();
            setSelectedSuppliers([]);
          }}
          onClearSelection={() => setSelectedSuppliers([])}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Carregando fornecedores...</span>
                </div>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum fornecedor encontrado com os filtros aplicados.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <SuppliersTable
                  suppliers={suppliers}
                  selectedSuppliers={selectedSuppliers}
                  onSelectAll={handleSelectAll}
                  onSelectSupplier={handleSelectSupplier}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleFeatured={handleToggleFeatured}
                  onDeleteSupplier={handleDeleteClick}
                  onRefresh={refetch}
                />

                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={isLoading}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <SupplierFormModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        supplier={null}
        onSuccess={handleAddSuccess}
      />

      <ConfirmDeleteDialog
        open={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        supplier={supplierToDelete}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}
