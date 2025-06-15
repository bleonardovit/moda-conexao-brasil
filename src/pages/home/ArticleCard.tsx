
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Article } from '@/types/article';

export function ArticleCard({ article }: { article: Article }) {
  const isMobile = useIsMobile();

  return (
    <Card className="glass-morphism border-white/10 card-hover overflow-hidden h-full transition-all duration-300 w-full flex flex-col">
      <div className="relative overflow-hidden w-full" style={{
        height: isMobile ? '130px' : '180px'
      }}>
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={e => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <Badge className="bg-[#9b87f5]/90 text-white border-0">
            {article.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="font-medium line-clamp-2 mb-3 flex-1">{article.title}</h3>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-400">
            {new Date(article.created_at).toLocaleDateString('pt-BR')}
          </span>
          <Link
            to={`/articles/${article.id}`}
            className="text-[#9b87f5] hover:text-[#D946EF] text-sm font-medium transition-colors flex items-center gap-1"
          >
            Ler mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
