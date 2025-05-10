
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById, getCategories } from '@/services/articleService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Article, ArticleCategory, getCategoryLabel } from '@/types/article';
import { ArrowLeft, Calendar, Loader2, User } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Carregar categorias
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Carregar artigo
        if (id) {
          const foundArticle = await getArticleById(id);
          if (foundArticle && foundArticle.published) {
            setArticle(foundArticle);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar artigo:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

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

  if (!article) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Artigo não encontrado</h2>
          <p className="mb-6 text-muted-foreground">
            O artigo que você está procurando não está disponível.
          </p>
          <Button asChild>
            <Link to="/articles">Voltar para artigos</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

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
