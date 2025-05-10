
import { useState, useEffect } from 'react';
import { ArticleCategory } from '@/types/article';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Check, Edit, Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCategory, updateCategory, deleteCategory } from '@/services/articleService';

export interface CategoryColorOption {
  id: string;
  name: string;
  bg: string;
  text: string;
}

const COLOR_OPTIONS: CategoryColorOption[] = [
  { id: 'blue', name: 'Azul', bg: 'bg-blue-100', text: 'text-blue-800' },
  { id: 'purple', name: 'Roxo', bg: 'bg-purple-100', text: 'text-purple-800' },
  { id: 'green', name: 'Verde', bg: 'bg-green-100', text: 'text-green-800' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-100', text: 'text-pink-800' },
  { id: 'amber', name: 'Âmbar', bg: 'bg-amber-100', text: 'text-amber-800' },
  { id: 'cyan', name: 'Ciano', bg: 'bg-cyan-100', text: 'text-cyan-800' },
  { id: 'red', name: 'Vermelho', bg: 'bg-red-100', text: 'text-red-800' },
  { id: 'orange', name: 'Laranja', bg: 'bg-orange-100', text: 'text-orange-800' }
];

interface CategoryEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: ArticleCategory) => void;
  initialCategory?: ArticleCategory;
}

function CategoryEditDialog({ open, onClose, onSave, initialCategory }: CategoryEditDialogProps) {
  const [id, setId] = useState(initialCategory?.id || '');
  const [label, setLabel] = useState(initialCategory?.label || '');
  const [selectedColor, setSelectedColor] = useState<string>(
    initialCategory ? initialCategory.color.split(' ')[0].replace('bg-', '') : 'blue'
  );
  const { toast } = useToast();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleIdChange = (newLabel: string) => {
    setLabel(newLabel);
    if (!initialCategory) { // Só gera slug automático para novas categorias
      setId(generateSlug(newLabel));
    }
  };

  const handleSave = () => {
    if (!label.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!id.trim()) {
      toast({
        title: 'Erro',
        description: 'O ID da categoria é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    const color = COLOR_OPTIONS.find(c => c.id === selectedColor);
    if (!color) {
      toast({
        title: 'Erro',
        description: 'Selecione uma cor válida',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      id,
      label,
      color: `${color.bg} ${color.text}`,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialCategory ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          <DialogDescription>
            {initialCategory 
              ? 'Atualize os detalhes da categoria existente.' 
              : 'Adicione uma nova categoria para os artigos.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Nome da categoria*</Label>
            <Input 
              id="label"
              value={label}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="Ex: Marketing Digital"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="id">ID da categoria*</Label>
            <Input 
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Ex: marketing"
              disabled={!!initialCategory} // Não permite editar o ID de categorias existentes
            />
            {!initialCategory && (
              <p className="text-xs text-muted-foreground">
                O ID é gerado automaticamente a partir do nome, mas pode ser editado.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Cor da categoria*</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-10 h-10 rounded-md ${color.bg} ${color.text} ${selectedColor === color.id ? 'ring-2 ring-offset-2 ring-brand-purple' : ''}`}
                  onClick={() => setSelectedColor(color.id)}
                >
                  {selectedColor === color.id && <Check className="h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${COLOR_OPTIONS.find(c => c.id === selectedColor)?.bg || ''} ${COLOR_OPTIONS.find(c => c.id === selectedColor)?.text || ''}`}>
              {label || 'Nome da categoria'}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryManagerProps {
  categories: ArticleCategory[];
  onCategoriesChange: (categories: ArticleCategory[]) => void;
  onClose?: () => void;
}

export function ArticleCategoryManager({ categories, onCategoriesChange, onClose }: CategoryManagerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<ArticleCategory | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOpenEditDialog = (category?: ArticleCategory) => {
    setCurrentCategory(category);
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: ArticleCategory) => {
    setCurrentCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSaveCategory = async (category: ArticleCategory) => {
    setLoading(true);
    try {
      // Verifica se é uma edição ou uma nova categoria
      if (currentCategory && categories.some(c => c.id === currentCategory.id)) {
        // Atualiza categoria existente
        const updatedCategory = await updateCategory(currentCategory.id, category);
        if (updatedCategory) {
          const updatedCategories = categories.map(c => 
            c.id === currentCategory.id ? updatedCategory : c
          );
          onCategoriesChange(updatedCategories);
          
          toast({
            title: "Sucesso",
            description: "Categoria atualizada com sucesso"
          });
        }
      } else {
        // Verifica se já existe uma categoria com o mesmo ID
        if (categories.some(c => c.id === category.id)) {
          toast({
            title: "Erro",
            description: "Já existe uma categoria com esse ID",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Adiciona nova categoria
        const newCategory = await createCategory(category);
        if (newCategory) {
          onCategoriesChange([...categories, newCategory]);
          
          toast({
            title: "Sucesso",
            description: "Categoria criada com sucesso"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a categoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setCurrentCategory(undefined);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    setLoading(true);
    try {
      const success = await deleteCategory(currentCategory.id);
      if (success) {
        const updatedCategories = categories.filter(c => c.id !== currentCategory.id);
        onCategoriesChange(updatedCategories);
        
        toast({
          title: "Sucesso",
          description: "Categoria excluída com sucesso"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a categoria",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a categoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCurrentCategory(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gerenciar categorias</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleOpenEditDialog()} 
            variant="default"
            size="sm"
            className="bg-brand-purple hover:bg-brand-purple/90"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova categoria
          </Button>
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              Fechar
            </Button>
          )}
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.label}</TableCell>
                  <TableCell className="font-mono text-sm">{category.id}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${category.color}`}>
                      {category.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleOpenEditDialog(category)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={deleteDialogOpen && currentCategory?.id === category.id} onOpenChange={() => setDeleteDialogOpen(false)}>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-600"
                            onClick={() => handleOpenDeleteDialog(category)}
                            disabled={loading}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza de que deseja excluir a categoria "{currentCategory?.label}"?
                              <br /><br />
                              Esta ação não pode ser desfeita e artigos associados a esta categoria ficarão sem categorização.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteCategory} 
                              className="bg-red-600 hover:bg-red-700"
                              disabled={loading}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground mb-2">Nenhuma categoria cadastrada</p>
          <Button 
            onClick={() => handleOpenEditDialog()} 
            variant="default"
            className="bg-brand-purple hover:bg-brand-purple/90"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar categoria
          </Button>
        </div>
      )}

      {/* Dialog para editar/criar categoria */}
      <CategoryEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setCurrentCategory(undefined);
        }}
        onSave={handleSaveCategory}
        initialCategory={currentCategory}
      />
    </div>
  );
}
