
import { Link } from "react-router-dom";
import { ArrowRight, Book } from "lucide-react";
import { ArticleCard } from './ArticleCard';
import { SkeletonCard } from './SkeletonCard';
import { Article } from '@/types/article';
import React from "react";

interface RecentArticlesSectionProps {
  recentArticles: Article[];
  loadingArticles: boolean;
}

export function RecentArticlesSection({
  recentArticles,
  loadingArticles
}: RecentArticlesSectionProps) {
  return (
    <section className="mb-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gradient">Artigos Recentes</h2>
        <Link to="/articles" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {loadingArticles ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={`article-skeleton-${i}`} />)}
        </div>
      ) : recentArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-full overflow-x-auto">
          {recentArticles.map(article => (
            <div key={article.id} className="animate-fade-in w-full max-w-full">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Book className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum artigo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Não há artigos publicados recentemente no sistema.
          </p>
        </div>
      )}
    </section>
  );
}
