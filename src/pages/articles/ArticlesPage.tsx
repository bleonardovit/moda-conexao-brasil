
import { useState } from 'react';
import { getArticles } from '@/services/articleService';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { CategoryFilter } from '@/components/articles/CategoryFilter';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArticleCategory } from '@/types/article';

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | undefined>(undefined);
  
  const articles = getArticles(selectedCategory);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Hero section */}
        <div className="py-8 px-4 text-center glass-morphism rounded-lg border-white/10 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent mb-2">
            Dicas & Conteúdo Exclusivo
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
            Conteúdo selecionado para impulsionar seu negócio e desenvolver suas habilidades como empreendedor(a).
          </p>
        </div>

        {/* Filter section */}
        <div className="mb-6">
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Nenhum artigo encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
