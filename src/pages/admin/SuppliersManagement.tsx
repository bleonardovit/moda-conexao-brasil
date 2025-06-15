
import { useState, useRef } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminSuppliersPagination } from '@/hooks/useAdminSuppliersPagination';
import { AdminSupplierFilters } from '@/components/admin/AdminSupplierFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { AdminBulkOperations } from '@/components/admin/AdminBulkOperations';
import { toggleSupplierFeatured, toggleSupplierVisibility } from '@/services/supplierService';
import { Eye, EyeOff, Star, StarOff, Edit, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import type { Supplier } from '@/types';

export default function SuppliersManagement() {
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

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

  const isSupplierSelected = (supplierId: string) => {
    return selectedSuppliers.some(s => s.id === supplierId);
  };

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

  const formatAvgPrice = (price: string) => {
    const priceMap = {
      'low': 'Baixo',
      'medium': 'Médio', 
      'high': 'Alto'
    };
    return priceMap[price as keyof typeof priceMap] || 'N/A';
  };

  const allSelected = suppliers.length > 0 && selectedSuppliers.length === suppliers.length;
  const someSelected = selectedSuppliers.length > 0 && selectedSuppliers.length < suppliers.length;

  // Set indeterminate state for select all checkbox
  if (selectAllCheckboxRef.current) {
    const checkboxElement = selectAllCheckboxRef.current.querySelector('button');
    if (checkboxElement) {
      (checkboxElement as any).indeterminate = someSelected;
    }
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Gerenciar Fornecedores | Admin Os Fornecedores</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerenciar Fornecedores</h1>
          <Link to="/admin/suppliers/bulk-upload">
            <Button>Importar Fornecedores</Button>
          </Link>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          ref={selectAllCheckboxRef}
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
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
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSupplierSelected(supplier.id)}
                            onCheckedChange={(checked) => handleSelectSupplier(supplier, checked as boolean)}
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
                              onClick={() => handleToggleVisibility(supplier)}
                              title={supplier.hidden ? "Mostrar fornecedor" : "Ocultar fornecedor"}
                            >
                              {supplier.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(supplier)}
                              title={supplier.featured ? "Remover destaque" : "Destacar fornecedor"}
                            >
                              {supplier.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                            </Button>
                            <Link to={`/suppliers/${supplier.id}`}>
                              <Button variant="ghost" size="sm" title="Editar fornecedor">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

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
    </AdminLayout>
  );
}
