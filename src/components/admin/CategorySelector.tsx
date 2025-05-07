
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger, 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import type { Category } from '@/types';

// Schema for form validation
const categorySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório").max(100, "O nome não pode ter mais de 100 caracteres"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categoryIds: string[]) => void;
  onAddCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => string;
}

export function CategorySelector({
  categories,
  selectedCategories,
  onChange,
  onAddCategory
}: CategorySelectorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Handle form submission
  const onSubmit = (values: CategoryFormValues) => {
    const newCategoryId = onAddCategory(values);
    
    // Add the new category to the selected list
    if (newCategoryId) {
      onChange([...selectedCategories, newCategoryId]);
    }
    
    // Reset form and close dialog
    form.reset();
    setIsAddDialogOpen(false);
  };

  // Toggle selection of a category
  const toggleCategory = (categoryId: string) => {
    const updatedSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    onChange(updatedSelection);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="categories">Categorias *</Label>
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Input
              id="category-search"
              placeholder="Filtrar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Nome da categoria"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Descrição da categoria"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
        <div className="space-y-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <div className="grid gap-0.5 leading-none">
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                  {category.description && (
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm ? "Nenhuma categoria corresponde à sua pesquisa." : "Nenhuma categoria disponível."}
            </p>
          )}
        </div>
      </div>
      {filteredCategories.length > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {selectedCategories.length} {selectedCategories.length === 1 ? "categoria selecionada" : "categorias selecionadas"}
          </span>
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => onChange([])}
          >
            Limpar seleção
          </button>
        </div>
      )}
    </div>
  );
}
