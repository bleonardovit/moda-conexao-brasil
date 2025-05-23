
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { getArticleById, getCategories, getLatestPublishedArticleIdForCategory } from '@/services/articleService'; // Adicionado getLatestPublishedArticleIdForCategory
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Article, ArticleCategory, getCategoryLabel } from '@/types/article';
import { ArrowLeft, Calendar, Loader2, User, Lock } from 'lucide-react'; // Adicionado Lock
import { useAuth } from '@/hooks/useAuth'; // Adicionado useAuth
import { checkFeatureAccess } from '@/services/featureAccessService'; // Adicionado checkFeatureAccess
import type { AccessCheckResult } from '@/types/featureAccess';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAccessible, setIsAccessible] = useState(false);
  const [accessRule, setAccessRule] = useState<AccessCheckResult | null>(null);

  useEffect(() => {
    async function loadDataAndCheckAccess() {
      setLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        let tempArticle: Article | null = null;
        if (id) {
          const foundArticle = await getArticleById(id);
          // A verificação de 'published' é crucial aqui, mesmo que o serviço já filtre.
          // Se um artigo não publicado for acessado por ID direto, não deve mostrar.
          if (foundArticle && foundArticle.published) {
            setArticle(foundArticle);
            tempArticle = foundArticle;
          }
        }

        if (tempArticle) {
          const accessResult = await checkFeatureAccess(user?.id, 'article_access');
          setAccessRule(accessResult);

          if (accessResult.access === 'full') {
            setIsAccessible(true);
          } else if (accessResult.access === 'limited_count') {
            const latestIdInCategory = await getLatestPublishedArticleIdForCategory(tempArticle.category);
            if (tempArticle.id === latestIdInCategory) {
              setIsAccessible(true);
            } else {
              setIsAccessible(false);
            }
          } else { // 'none' or other states
            setIsAccessible(false);
          }
        } else {
          // Artigo não encontrado ou não publicado
          setIsAccessible(false); 
        }

      } catch (error) {
        console.error("Erro ao carregar artigo ou verificar acesso:", error);
        setIsAccessible(false);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) { // Apenas carrega se houver ID
        loadDataAndCheckAccess();
    } else {
        setLoading(false); // Se não houver ID, para o loading
    }
  }, [id, user]);

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
              {accessRule?.message || "Este conteúdo é exclusivo para assinantes."}
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
