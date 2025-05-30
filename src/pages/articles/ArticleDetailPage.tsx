
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArticleById, getCategories, getLatestPublishedArticleIdForCategory } from '@/services/articleService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Article, ArticleCategory, getCategoryLabel } from '@/types/article';
import { ArrowLeft, Calendar, Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { checkFeatureAccess } from '@/services/featureAccessService';
import type { AccessCheckResult } from '@/types/featureAccess';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasExpired: trialHasExpired, isLoading: trialLoading } = useTrialStatus();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccessible, setIsAccessible] = useState(false);
  const [accessRule, setAccessRule] = useState<AccessCheckResult | null>(null);

  useEffect(() => {
    async function loadDataAndCheckAccess() {
      if (trialLoading) return; // Espera verificação do trial
      
      setLoading(true);
      let currentArticle: Article | null = null;
      let currentIsAccessible = false;
      let currentAccessRule: AccessCheckResult | null = null;

      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        if (id) {
          const foundArticle = await getArticleById(id);
          if (foundArticle && foundArticle.published) {
            currentArticle = foundArticle;
          }
        }

        if (trialHasExpired) {
          currentIsAccessible = false;
          currentAccessRule = {
            access: 'none', 
            message: "Seu período de teste expirou. Assine para ler o conteúdo completo." 
          };
        } else if (currentArticle) {
          const accessResult = await checkFeatureAccess(user?.id, 'article_access');
          currentAccessRule = accessResult;

          if (accessResult.access === 'full') {
            currentIsAccessible = true;
          } else if (accessResult.access === 'limited_count') {
            const latestIdInCategory = await getLatestPublishedArticleIdForCategory(currentArticle.category);
            if (currentArticle.id === latestIdInCategory) {
              currentIsAccessible = true;
            } else {
              currentIsAccessible = false;
            }
          } else { // 'none' or other states
            currentIsAccessible = false;
          }
        } else {
          currentIsAccessible = false; 
        }

      } catch (error) {
        console.error("Erro ao carregar artigo ou verificar acesso:", error);
        currentIsAccessible = false;
        // Potentially set a generic error message for currentAccessRule here if needed
      } finally {
        setArticle(currentArticle);
        setIsAccessible(currentIsAccessible);
        setAccessRule(currentAccessRule);
        setLoading(false);
      }
    }
    
    if (id) {
        loadDataAndCheckAccess();
    } else {
        setLoading(false);
    }
  }, [id, user, trialHasExpired, trialLoading]);

  // Se ainda está carregando a verificação do trial, mostra loading
  if (trialLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple mr-2" />
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </AppLayout>
    );
  }

  const formattedDate = article ? new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
        </div>
      </AppLayout>
    );
  }

  if (!article) { // Se o artigo não foi carregado (ou não é publicado)
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Artigo não encontrado</h2>
          <p className="mb-6 text-muted-foreground">
            O artigo que você está procurando não está disponível ou não foi encontrado.
          </p>
          <Button asChild>
            <Link to="/articles">Voltar para artigos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Se o artigo existe mas não é acessível
  if (!isAccessible) {
    const lockedMessage = trialHasExpired
      ? "Seu período de teste expirou. Assine para ler o conteúdo completo."
      : accessRule?.message || "Este conteúdo é exclusivo para assinantes.";

    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 flex items-center gap-2" 
            asChild
          >
            <Link to="/articles">
              <ArrowLeft className="h-4 w-4" />
              Voltar para artigos
            </Link>
          </Button>

          <div className="glass-morphism rounded-lg border-white/10 p-6 mb-6 text-center">
            <Lock size={48} className="mx-auto mb-4 text-brand-purple" />
            <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
            {article.image_url && (
              <div className="w-full max-w-md mx-auto overflow-hidden rounded-lg my-4">
                <img 
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-auto max-h-[300px] object-cover"
                />
              </div>
            )}
            <p className="text-lg text-muted-foreground mb-6 line-clamp-3">
              {article.summary}
            </p>
            <p className="text-amber-500 font-semibold text-lg mb-6">
              {lockedMessage}
            </p>
            <Button size="lg" className="bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90" onClick={() => navigate('/auth/select-plan')}>
              Ver Planos de Assinatura
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Artigo acessível
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto pb-12 animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 flex items-center gap-2" 
          asChild
        >
          <Link to="/articles">
            <ArrowLeft className="h-4 w-4" />
            Voltar para artigos
          </Link>
        </Button>

        <div className="glass-morphism rounded-lg border-white/10 p-6 mb-6">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-purple/20 text-brand-purple mb-4">
            {getCategoryLabel(article.category, categories)}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center text-sm text-muted-foreground gap-6 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {article.image_url && (
            <div className="w-full overflow-hidden rounded-lg mb-8">
              <img 
                src={article.image_url}
                alt={article.title}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </AppLayout>
  );
}
