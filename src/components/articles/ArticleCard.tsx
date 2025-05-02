
import { Article } from '@/types/article';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS } from '@/types/article';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col glass-morphism border-white/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-brand-purple/20 text-brand-purple mb-2">
              {CATEGORY_LABELS[article.category]}
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
        <Button variant="outline" className="w-full bg-brand-purple/10 hover:bg-brand-purple/20 border-brand-purple/30" asChild>
          <Link to={`/articles/${article.id}`}>
            Ler artigo
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
