
import { useState, useEffect } from 'react';
import { getArticles, getCategories } from '@/services/articleService';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { CategoryFilter } from '@/components/articles/CategoryFilter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Article, ArticleCategory } from '@/types/article';
import { Loader2 } from 'lucide-react';

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Carregar categorias ao iniciar
    async function loadData() {
      try {
        setIsLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  useEffect(() => {
    // Carregar artigos quando a categoria for alterada
    async function loadArticles() {
      try {
        setIsLoading(true);
        const articlesData = await getArticles(selectedCategory);
        // Filtrar apenas artigos publicados (para usuários normais)
        setArticles(articlesData.filter(article => article.published));
      } catch (error) {
        console.error("Erro ao carregar artigos:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadArticles();
  }, [selectedCategory]);

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
        {!isLoading && (
          <div className="mb-6">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </div>
        )}

        {/* Articles grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} categories={categories} />
              ))}
            </div>

            {articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Nenhum artigo encontrado nesta categoria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
