
import { Article, ArticleCategory, getCategoryLabel, getCategoryColors } from '@/types/article';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, EyeOff, Lock } from 'lucide-react'; // Adicionado Lock
import { Link } from 'react-router-dom';

interface ArticleCardProps {
  article: Article;
  categories: ArticleCategory[];
  showPublishStatus?: boolean;
  isLocked?: boolean; // Nova propriedade
  lockedMessage?: string; // Nova propriedade
}

export function ArticleCard({ 
  article, 
  categories, 
  showPublishStatus = false, 
  isLocked = false, 
  lockedMessage = "Assine para ler o conteúdo completo." 
}: ArticleCardProps) {
  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const categoryColor = getCategoryColors(article.category, categories);
  const categoryLabel = getCategoryLabel(article.category, categories);

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 h-full flex flex-col glass-morphism border-white/10 ${isLocked ? 'opacity-80' : ''}`}>
      {article.image_url && (
        <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="object-cover w-full h-full"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex gap-2 items-center mb-2">
              <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                {categoryLabel}
              </div>
              {showPublishStatus && (
                <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  article.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {article.published 
                    ? <><Eye className="mr-1 h-3 w-3" />Publicado</>
                    : <><EyeOff className="mr-1 h-3 w-3" />Rascunho</>
                  }
                </div>
              )}
            </div>
            <CardTitle className="text-xl mb-2 line-clamp-2">{article.title}</CardTitle>
          </div>
        </div>
        <CardDescription className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter className="pt-2">
        {isLocked ? (
          <Button variant="outline" className="w-full bg-brand-pink/80 hover:bg-brand-pink text-white border-brand-pink/30" asChild>
            <Link to="/auth/select-plan">
              <Lock className="mr-2 h-4 w-4" />
              {lockedMessage.includes("Desbloqueie") || lockedMessage.includes("Veja o conteúdo") ? "Ver Planos" : "Conteúdo para Assinantes"}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full bg-brand-purple/10 hover:bg-brand-purple/20 border-brand-purple/30" asChild>
            <Link to={`/articles/${article.id}`}>
              Ler artigo
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
