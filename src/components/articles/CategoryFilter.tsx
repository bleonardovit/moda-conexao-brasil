
import { CATEGORY_LABELS, CATEGORY_COLORS, ArticleCategory } from '@/types/article';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  selectedCategory: ArticleCategory | undefined;
  onSelectCategory: (category: ArticleCategory | undefined) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
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
      
      {(Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][]).map(([category, label]) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category as ArticleCategory)}
          className={selectedCategory === category 
            ? "bg-brand-purple text-white" 
            : `hover:${CATEGORY_COLORS[category as ArticleCategory]}`
          }
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
