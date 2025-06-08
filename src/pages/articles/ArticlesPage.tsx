
import { useState, useEffect } from 'react';
import { getArticles, getCategories, getLatestPublishedArticleIdForCategory, getLatestPublishedArticleIdsPerCategory } from '@/services/articleService';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { CategoryFilter } from '@/components/articles/CategoryFilter';
import { AppLayout } from '@/components/layout/AppLayout';
import { Article, ArticleCategory } from '@/types/article';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { checkFeatureAccess } from '@/services/featureAccessService';
import type { AccessCheckResult } from '@/types/featureAccess';

export default function ArticlesPage() {
  const { user } = useAuth();
  const { hasExpired: trialHasExpired } = useTrialStatus();
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
      if (categories.length === 0 && !selectedCategory) {
          return; 
      }

      setIsLoadingArticles(true);
      try {
        const accessResult = await checkFeatureAccess(user?.id, 'article_access');
        setAccessRule(accessResult);

        let currentAllowedIds: string[] = [];
        if (trialHasExpired) {
          // Se o trial expirou, nenhum artigo é permitido além do que a regra de não assinante permitiria
          // A lógica de `articlesToDisplay` vai tratar o bloqueio visual.
          // `allowedArticleIds` pode ser populado conforme a regra `non_subscriber_access_level`
          // que `checkFeatureAccess` já deve retornar se o trial está expirado no backend.
        }
        
        if (accessResult.access === 'full' && !trialHasExpired) {
          // Acesso total e trial não expirado: permite todos os artigos (ou seja, não precisa popular currentAllowedIds para checagem)
        } else if (accessResult.access === 'limited_count' && !trialHasExpired) {
          if (selectedCategory) {
            const latestId = await getLatestPublishedArticleIdForCategory(selectedCategory);
            if (latestId) currentAllowedIds.push(latestId);
          } else {
             if (categories.length > 0) {
                currentAllowedIds = await getLatestPublishedArticleIdsPerCategory(categories);
             }
          }
        }
        // Se trialHasExpired é true, accessResult já deve refletir o acesso de não-assinante (ou 'none').
        // Se accessResult.access for 'limited_count' (vindo de non_subscriber_access_level), 
        // os IDs permitidos serão populados aqui.
        else if (accessResult.access === 'limited_count' && trialHasExpired) {
           if (selectedCategory) {
            const latestId = await getLatestPublishedArticleIdForCategory(selectedCategory);
            if (latestId) currentAllowedIds.push(latestId);
          } else {
             if (categories.length > 0) {
                currentAllowedIds = await getLatestPublishedArticleIdsPerCategory(categories);
             }
          }
        }

        setAllowedArticleIds(currentAllowedIds);

        const articlesData = await getArticles(selectedCategory);
        setArticles(articlesData);

      } catch (error) {
        console.error("Erro ao determinar acesso ou carregar artigos:", error);
        setArticles([]); 
        setAllowedArticleIds([]);
      } finally {
        setIsLoadingArticles(false);
        setIsLoading(false); 
      }
    }

    determineAccessAndLoadArticles();
  }, [user, selectedCategory, categories, trialHasExpired]);

  const articlesToDisplay = articles.map(article => {
    let isLockedLogically: boolean;
    if (trialHasExpired) {
      isLockedLogically = true; // Se o trial expirou, todos os artigos ficam bloqueados na UI
    } else if (accessRule?.access === 'full') {
      isLockedLogically = false;
    } else { // limited_count or none
      isLockedLogically = !allowedArticleIds.includes(article.id);
    }
    
    return {
      ...article,
      isLocked: isLockedLogically,
    };
  });

  const lockedMessageForCard = trialHasExpired 
    ? "Seu período de teste expirou. Assine para ler o conteúdo completo."
    : accessRule?.message || "Assine para ler o conteúdo completo.";

  const pageTitle = selectedCategory 
    ? `Artigos - ${categories.find(c => c.id === selectedCategory)?.label || 'Categoria'}`
    : 'Dicas & Conteúdo Exclusivo';

  return (
    <AppLayout 
      title={pageTitle}
      description="Conteúdo selecionado para impulsionar seu negócio e desenvolver suas habilidades como empreendedor(a)."
    >
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
        {(categories.length > 0 || selectedCategory) && (
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
                  lockedMessage={lockedMessageForCard}
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
