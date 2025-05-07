
import { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types';
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
import { updateCategory, deleteCategory, createCategory } from '@/services/categoryService';

// Schema for form validation
const categorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(100, "O nome não pode ter mais de 100 caracteres"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryManagementProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export function CategoryManagement({ categories, setCategories }: CategoryManagementProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Open the dialog for adding a new category
  const openAddDialog = () => {
    form.reset({ name: '', description: '' });
    setIsEditMode(false);
    setCategoryToEdit(null);
    setIsAddDialogOpen(true);
  };

  // Open the dialog for editing a category
  const openEditDialog = (category: Category) => {
    form.reset({ 
      name: category.name,
      description: category.description || '',
    });
    setIsEditMode(true);
    setCategoryToEdit(category);
    setIsAddDialogOpen(true);
  };

  // Confirm deletion of a category
  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEditMode && categoryToEdit) {
        // Update existing category
        const updatedCategory = await updateCategory(categoryToEdit.id, values);
        
        // Update local state
        setCategories(categories.map(c => 
          c.id === categoryToEdit.id ? updatedCategory : c
        ));

        toast({
          title: "Categoria atualizada",
          description: `A categoria "${values.name}" foi atualizada com sucesso.`,
        });
      } else {
        // Create new category
        const newCategory = await createCategory(values);
        
        // Update local state
        setCategories([...categories, newCategory]);

        toast({
          title: "Categoria criada",
          description: `A categoria "${values.name}" foi criada com sucesso.`,
        });
      }

      // Close dialog
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive",
      });
    }
  };

  // Delete a category
  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id);
        
        // Update local state
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));

        toast({
          title: "Categoria excluída",
          description: `A categoria "${categoryToDelete.name}" foi excluída com sucesso.`,
        });

        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a categoria.",
          variant: "destructive",
        });
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Categorias</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>
      
      {/* Search input */}
      <div className="relative">
        <Input
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {/* Categories table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{category.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete(category)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhuma categoria encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Edite os detalhes da categoria existente.'
                : 'Preencha os detalhes para criar uma nova categoria.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da categoria"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Salvar Alterações' : 'Criar Categoria'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria{' '}
              <span className="font-semibold">{categoryToDelete?.name}</span>{' '}
              e removerá sua associação com todos os fornecedores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
