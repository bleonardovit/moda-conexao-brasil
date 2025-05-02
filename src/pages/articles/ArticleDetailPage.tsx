
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleById } from '@/services/articleService';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Article, CATEGORY_LABELS } from '@/types/article';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundArticle = getArticleById(id);
      if (foundArticle) {
        setArticle(foundArticle);
      }
      setLoading(false);
    }
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
          <div className="animate-pulse h-6 w-24 bg-muted rounded"></div>
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
            {CATEGORY_LABELS[article.category]}
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
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </AppLayout>
  );
}
