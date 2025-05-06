import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/types';
import { deleteCategory, updateCategory } from '@/services/supplierService';

export interface CategoryManagementProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onAddCategory: (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
}

export const CategoryDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  initialCategory?: Partial<Category>;
}> = ({ isOpen, onClose, onSave, initialCategory }) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      description 
    });
    onClose();
  };
  
  return (
    <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialCategory?.id ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Nome da categoria"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Descrição (opcional)"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CategoryManagement: React.FC<CategoryManagementProps> = ({ 
  categories, 
  setCategories,
  onAddCategory
}) => {
  const { toast } = useToast();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrar categorias
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Abrir modal para adicionar categoria
  const openAddModal = () => {
    setCurrentCategory(null);
    setIsAddCategoryOpen(true);
  };
  
  // Abrir modal para editar categoria
  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setIsEditCategoryOpen(true);
  };
  
  // Confirmar exclusão
  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };
  
  // Excluir categoria
  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id);
        
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        
        toast({
          title: "Categoria excluída",
          description: `${categoryToDelete.name} foi removida com sucesso.`,
          variant: "default",
        });
      } catch (err) {
        console.error('Error deleting category:', err);
        toast({
          title: "Erro ao excluir categoria",
          description: "Ocorreu um erro ao excluir a categoria. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      }
    }
  };
  
  // Salvar categoria (nova ou editada)
  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (currentCategory) {
        // Editar categoria existente
        const updatedCategory = await updateCategory(currentCategory.id, categoryData);
        
        setCategories(prev => prev.map(c => c.id === currentCategory.id ? updatedCategory : c));
        
        toast({
          title: "Categoria atualizada",
          description: `${categoryData.name} foi atualizada com sucesso.`,
          variant: "default",
        });
        
        setIsEditCategoryOpen(false);
      } else {
        // Adicionar nova categoria
        // Use a função onAddCategory para salvar no banco de dados e obter o ID
        const newCategoryId = await onAddCategory(categoryData);
        
        // Se a adição foi bem-sucedida (onAddCategory já faz o toast de sucesso)
        if (newCategoryId) {
          setIsAddCategoryOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving category:', err);
      toast({
        title: "Erro ao salvar categoria",
        description: "Ocorreu um erro ao salvar a categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Categorias de Fornecedores</h2>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Categoria
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  Nenhuma categoria encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => openEditModal(category)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => confirmDelete(category)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Modal para adicionar categoria */}
      <CategoryDialog
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSave={handleSaveCategory}
      />
      
      {/* Modal para editar categoria */}
      <CategoryDialog
        isOpen={isEditCategoryOpen}
        onClose={() => setIsEditCategoryOpen(false)}
        onSave={handleSaveCategory}
        initialCategory={currentCategory || undefined}
      />
      
      {/* Confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria 
              <span className="font-bold">{' '}{categoryToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
