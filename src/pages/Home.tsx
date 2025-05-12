
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Star, ArrowRight, Users, Book } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useFavorites } from '@/hooks/use-favorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { Supplier } from '@/types';
import { Article } from '@/types/article';
import { getSuppliers, searchSuppliers } from '@/services/supplierService';
import { getArticles } from '@/services/articleService';
import { Skeleton } from '@/components/ui/skeleton';

// Component for supplier card - optimized for mobile
const SupplierCard = ({ supplier }: { supplier: Supplier }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <Card 
      className="glass-morphism border-white/10 card-hover overflow-hidden h-full transition-all duration-300 w-full max-w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative overflow-hidden w-full" style={{ height: isMobile ? '130px' : '180px' }}>
        <img 
          src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'} 
          alt={supplier.name} 
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';
          }}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {supplier.featured && (
            <Badge className="bg-[#F97316]/90 text-white border-0">
              <Star className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(supplier.id);
            }}
            className="bg-black/40 hover:bg-black/60 p-2 rounded-full text-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorite(supplier.id) ? "fill-[#D946EF] text-[#D946EF]" : ""}`} />
          </button>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate">{supplier.name}</h3>
        </div>
        <div className="flex gap-2 mb-2 flex-wrap">
          {supplier.categories && supplier.categories.slice(0, 2).map(category => (
            <Badge key={category} variant="secondary" className="bg-white/10">
              {category}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{supplier.city}, {supplier.state}</span>
          <Link 
            to={`/suppliers/${supplier.id}`} 
            className="text-[#9b87f5] hover:text-[#D946EF] text-sm font-medium transition-colors flex items-center gap-1"
          >
            Ver detalhes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for article card
const ArticleCard = ({ article }: { article: Article }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="glass-morphism border-white/10 card-hover overflow-hidden h-full transition-all duration-300 w-full max-w-full">
      <div className="relative overflow-hidden w-full" style={{ height: isMobile ? '130px' : '160px' }}>
        <img 
          src={article.image_url} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df';
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <Badge className="bg-[#9b87f5]/90 text-white border-0">
            {article.category}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium line-clamp-2 mb-2">{article.title}</h3>
        <div className="flex justify-between items-center">
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
};

// Loading skeleton for cards
const SkeletonCard = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="glass-morphism border-white/10 overflow-hidden h-full w-full max-w-full">
      <Skeleton className="w-full" style={{ height: isMobile ? '130px' : '180px' }} />
      <CardContent className="p-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between items-center mt-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function Home() {
  const isMobile = useIsMobile();
  
  // Fetch recent suppliers
  const { data: allSuppliers, isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: getSuppliers
  });

  // Fetch articles
  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => getArticles()
  });

  // Get recent suppliers (sorted by creation date)
  const recentSuppliers = allSuppliers 
    ? [...allSuppliers]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
    : [];

  // Get popular suppliers (featured)
  const popularSuppliers = allSuppliers 
    ? allSuppliers.filter(supplier => supplier.featured)
    : [];
  
  // Get recent articles
  const recentArticles = articles 
    ? [...articles]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    : [];

  return (
    <AppLayout>
      {/* Recent Suppliers Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores Recentes</h2>
          <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loadingSuppliers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={`recent-skeleton-${i}`} />
            ))}
          </div>
        ) : recentSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-full overflow-x-auto">
            {recentSuppliers.map(supplier => (
              <div key={supplier.id} className="animate-fade-in w-full max-w-full">
                <SupplierCard supplier={supplier} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não há fornecedores cadastrados recentemente no sistema.
            </p>
          </div>
        )}
      </section>

      {/* Popular Suppliers Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores Populares</h2>
          <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loadingSuppliers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={`popular-skeleton-${i}`} />
            ))}
          </div>
        ) : popularSuppliers.length > 0 ? (
          <div className="w-full max-w-full overflow-x-auto">
            <Carousel className="w-full max-w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {popularSuppliers.map(supplier => (
                  <CarouselItem key={supplier.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 w-full max-w-full">
                    <SupplierCard supplier={supplier} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
              <CarouselNext className="right-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
            </Carousel>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum fornecedor em destaque</h3>
            <p className="text-muted-foreground mb-4">
              Não há fornecedores em destaque no sistema.
            </p>
          </div>
        )}
      </section>
      
      {/* Recent Articles Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl md:text-2xl font-bold text-gradient">Artigos Recentes</h2>
          <Link to="/articles" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={`article-skeleton-${i}`} />
            ))}
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
    </AppLayout>
  );
}
