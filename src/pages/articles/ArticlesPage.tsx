
import { useState, useEffect } from 'react';
import { getArticles, getCategories, getLatestPublishedArticleIdForCategory, getLatestPublishedArticleIdsPerCategory } from '@/services/articleService';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { CategoryFilter } from '@/components/articles/CategoryFilter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Article, ArticleCategory } from '@/types/article';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { checkFeatureAccess } from '@/services/featureAccessService';
import type { AccessCheckResult } from '@/types/featureAccess';

export default function ArticlesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [allowedArticleIds, setAllowedArticleIds] = useState<string[]>([]);
  const [accessRule, setAccessRule] = useState<AccessCheckResult | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        // setIsLoading(true); // Handled by specific loaders now
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function determineAccessAndLoadArticles() {
      if (categories.length === 0 && !selectedCategory) { // Aguarda categorias se não houver categoria selecionada
          // console.log("Aguardando categorias para determinar acesso...");
          return; 
      }

      setIsLoadingArticles(true);
      try {
        const accessResult = await checkFeatureAccess(user?.id, 'article_access');
        setAccessRule(accessResult);

        let currentAllowedIds: string[] = [];
        if (accessResult.access === 'full') {
          // Carrega todos os artigos e permite todos
        } else if (accessResult.access === 'limited_count') {
          if (selectedCategory) {
            const latestId = await getLatestPublishedArticleIdForCategory(selectedCategory);
            if (latestId) currentAllowedIds.push(latestId);
          } else {
            // Se todas as categorias ou nenhuma categoria específica selecionada, pega o último de cada uma.
             if (categories.length > 0) {
                currentAllowedIds = await getLatestPublishedArticleIdsPerCategory(categories);
             } else {
                // Se não há categorias carregadas, mas uma selecionada (improvável aqui), ou se categorias é vazio.
                // Este caso pode precisar de ajuste se categorias demorar muito para carregar.
                // Por ora, se não há categorias e nenhuma selecionada, nenhum artigo será permitido.
             }
          }
        }
        setAllowedArticleIds(currentAllowedIds);

        // Carregar artigos
        const articlesData = await getArticles(selectedCategory);
        // O filtro de `published` agora é feito no `getArticles`
        setArticles(articlesData);

      } catch (error) {
        console.error("Erro ao determinar acesso ou carregar artigos:", error);
        setArticles([]); // Limpa artigos em caso de erro
        setAllowedArticleIds([]);
      } finally {
        setIsLoadingArticles(false);
        setIsLoading(false); // Define isLoading geral como false após a primeira carga
      }
    }

    determineAccessAndLoadArticles();
  }, [user, selectedCategory, categories]); // Adicionado categories como dependência

  const articlesToDisplay = articles.map(article => ({
    ...article,
    isLocked: accessRule?.access === 'full' ? false : !allowedArticleIds.includes(article.id),
  }));


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
        {(categories.length > 0 || selectedCategory) && ( // Mostrar filtro se houver categorias ou uma selecionada
          <div className="mb-6">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </div>
        )}

        {/* Articles grid */}
        {isLoading || isLoadingArticles ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articlesToDisplay.map(articleWithLock => (
                <ArticleCard 
                  key={articleWithLock.id} 
                  article={articleWithLock} 
                  categories={categories}
                  isLocked={articleWithLock.isLocked}
                  lockedMessage={accessRule?.message || "Assine para ler o conteúdo completo."}
                />
              ))}
            </div>

            {articlesToDisplay.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  {selectedCategory ? "Nenhum artigo encontrado nesta categoria." : "Nenhum artigo encontrado."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
