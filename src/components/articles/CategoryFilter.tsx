
import { ArticleCategory } from '@/types/article';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: ArticleCategory[];
  selectedCategory: string | undefined;
  onSelectCategory: (category: string | undefined) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button 
        variant={!selectedCategory ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory(undefined)}
        className={!selectedCategory ? "bg-brand-purple text-white" : ""}
      >
        Todos
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.id)}
          className={selectedCategory === category.id 
            ? "bg-brand-purple text-white" 
            : `hover:${category.color.split(' ')[0]}`
          }
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
