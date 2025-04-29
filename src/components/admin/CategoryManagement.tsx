
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, Search } from 'lucide-react';
import { Category } from '@/types';

// Dados de exemplo para categorias
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Casual',
    description: 'Roupas para uso diário',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '2',
    name: 'Fitness',
    description: 'Roupas esportivas e fitness',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '3',
    name: 'Plus Size',
    description: 'Moda em tamanhos maiores',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '4',
    name: 'Acessórios',
    description: 'Bolsas, cintos, bijuterias etc',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '5',
    name: 'Praia',
    description: 'Roupas de praia e verão',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  }
];

export const CategoryDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  initialCategory?: Category;
}> = ({ isOpen, onClose, onSave, initialCategory }) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [description, setDescription] = useState(initialCategory?.description || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    onSave({ name, description });
    onClose();
    
    // Reset form
    setName('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            {initialCategory 
              ? 'Edite os dados da categoria existente.' 
              : 'Adicione uma nova categoria para organizar seus fornecedores.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome da categoria *
            </label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Moda Infantil"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Uma breve descrição da categoria (opcional)"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialCategory ? 'Salvar alterações' : 'Adicionar categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  // Filtrar categorias com base na busca
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Abrir diálogo para adicionar nova categoria
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // Abrir diálogo para editar categoria
  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo para confirmar exclusão
  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Adicionar nova categoria
  const addCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const newCategory: Category = {
      id: `${categories.length + 1}`,
      name: categoryData.name,
      description: categoryData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setCategories([...categories, newCategory]);
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
      variant: "default",
    });
  };

  // Editar categoria existente
  const editCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentCategory) return;
    
    const updatedCategories = categories.map(category =>
      category.id === currentCategory.id
        ? {
            ...category,
            name: categoryData.name,
            description: categoryData.description,
            updated_at: new Date().toISOString(),
          }
        : category
    );
    
    setCategories(updatedCategories);
    
    toast({
      title: "Categoria atualizada",
      description: `A categoria "${categoryData.name}" foi atualizada com sucesso.`,
      variant: "default",
    });
  };

  // Excluir categoria
  const deleteCategory = () => {
    if (!currentCategory) return;
    
    const updatedCategories = categories.filter(
      category => category.id !== currentCategory.id
    );
    
    setCategories(updatedCategories);
    
    toast({
      title: "Categoria excluída",
      description: `A categoria "${currentCategory.name}" foi removida com sucesso.`,
      variant: "default",
    });
    
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Categorias</CardTitle>
        <CardDescription>
          Crie, edite e gerencie as categorias disponíveis para classificar seus fornecedores.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        
        {filteredCategories.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.description || 
                        <span className="text-muted-foreground text-sm italic">
                          Sem descrição
                        </span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">
                            Editar
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-600 hover:bg-red-100/20"
                          onClick={() => openDeleteDialog(category)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only md:not-sr-only md:ml-2">
                            Excluir
                          </span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border rounded-md p-8">
            {searchTerm ? (
              <>
                <p className="text-muted-foreground mb-2">
                  Nenhuma categoria encontrada para "{searchTerm}".
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">
                  Nenhuma categoria cadastrada.
                </p>
                <Button onClick={openAddDialog}>
                  Criar primeira categoria
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {filteredCategories.length} {filteredCategories.length === 1 ? 'categoria' : 'categorias'} {searchTerm ? 'encontrada' : 'cadastrada'}{searchTerm ? `s para "${searchTerm}"` : ''}
        </div>
      </CardFooter>
      
      {/* Diálogo para adicionar categoria */}
      <CategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={addCategory}
      />
      
      {/* Diálogo para editar categoria */}
      <CategoryDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={editCategory}
        initialCategory={currentCategory || undefined}
      />
      
      {/* Diálogo para confirmar exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{currentCategory?.name}"?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
