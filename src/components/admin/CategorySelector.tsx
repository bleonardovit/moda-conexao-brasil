
import React, { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CategoryDialog } from './CategoryManagement';
import { Category } from '@/types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  onAddCategory?: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategories,
  onChange,
  onAddCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  
  // Filtrar categorias com base na pesquisa
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Alternar a seleção de uma categoria
  const toggleCategory = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    if (isSelected) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };
  
  // Obter nome da categoria a partir do ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };
  
  // Remover uma categoria selecionada
  const removeCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedCategories.filter(id => id !== categoryId));
  };
  
  // Adicionar nova categoria
  const handleAddCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    if (onAddCategory) {
      onAddCategory(categoryData);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Categorias</Label>
        {onAddCategory && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddCategoryOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Nova
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCategories.length > 0 ? (
          selectedCategories.map(categoryId => (
            <Badge key={categoryId} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {getCategoryName(categoryId)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => removeCategory(categoryId, e)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover</span>
              </Button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria selecionada
          </p>
        )}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
          >
            Selecionar categorias
            <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
              {selectedCategories.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="Procurar categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </div>
          {filteredCategories.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className={`
                        flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer
                        ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                      `}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria disponível'}
              </p>
              {onAddCategory && searchTerm && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setIsAddCategoryOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar "{searchTerm}"
                </Button>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {/* Dialog para adicionar nova categoria */}
      {onAddCategory && (
        <CategoryDialog
          isOpen={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onSave={handleAddCategory}
          initialCategory={searchTerm ? { id: '', name: searchTerm, created_at: '', updated_at: '' } : undefined}
        />
      )}
    </div>
  );
};
