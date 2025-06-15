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
import { useTrialStatus } from '@/hooks/use-trial-status';
import { Supplier } from '@/types';
import { Article } from '@/types/article';
import { Category } from '@/types';
import { getOptimizedHomeSuppiers } from '@/services/supplier/optimizedHomeQueries';
import { getArticles } from '@/services/articleService';
import { getCategories } from '@/services/categoryService';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { OptimizedSupplierCard } from '@/components/suppliers/OptimizedSupplierCard';

// Component for article card
const ArticleCard = ({
  article
}: {
  article: Article;
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="glass-morphism border-white/10 card-hover overflow-hidden h-full transition-all duration-300 w-full max-w-full">
      <div className="relative overflow-hidden w-full" style={{
        height: isMobile ? '130px' : '160px'
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
      <CardContent className="p-4">
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
      <Skeleton className="w-full" style={{
        height: isMobile ? '130px' : '180px'
      }} />
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
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Usar query otimizada para suppliers da home com cache de 10 minutos
  const {
    data: homeSuppliers,
    isLoading: loadingSuppliers
  } = useQuery({
    queryKey: ['home-suppliers', user?.id],
    queryFn: () => getOptimizedHomeSuppiers(user?.id, 6, 8),
    staleTime: 10 * 60 * 1000, // 10 minutos de cache
    gcTime: 15 * 60 * 1000, // 15 minutos no garbage collector
  });

  // Fetch articles com cache
  const {
    data: articles,
    isLoading: loadingArticles
  } = useQuery({
    queryKey: ['articles'],
    queryFn: () => getArticles(),
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Fetch all categories com cache
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setAllCategories(categoriesData);
      } catch (err) {
        console.error("Erro ao buscar todas as categorias:", err);
      }
    };
    fetchAllCategories();
  }, []);

  // Funções auxiliares para categorias e preço para passar ao OptimizedSupplierCard:
  const getCategoryName = (categoryId: string): string => {
    const foundCategory = allCategories.find(cat => cat.id === categoryId);
    return foundCategory ? foundCategory.name : categoryId;
  };

  const getCategoryStyle = (categoryName: string): string => {
    // Estilo simples de categoria
    return "bg-white/10";
  };

  const formatAvgPrice = (price: string): string => {
    const priceMap = {
      'low': 'Baixo',
      'medium': 'Médio', 
      'high': 'Alto'
    };
    return priceMap[price as keyof typeof priceMap] || price;
  };

  const handleToggleFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(supplier.id);
  };

  // Extrair suppliers otimizados
  const featuredSuppliers = homeSuppliers?.featuredSuppliers || [];
  const recentSuppliers = homeSuppliers?.recentSuppliers || [];

  // Get recent articles
  const recentArticles = articles ? [...articles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3) : [];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="mb-8 pt-4 md:pt-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-4 animate-fade-in-down">
          Bem-vindo
        </h1>
        <p className="text-md sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
          Sua plataforma completa para encontrar os melhores fornecedores, descobrir tendências e impulsionar seu negócio de moda.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in-up animation-delay-600">
          <Button asChild size="lg" className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90 transition-opacity text-white shadow-lg hover:shadow-xl transform hover:scale-105">
            <Link to="/suppliers">Explorar Fornecedores</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Link to="/articles">Ver Artigos do Blog</Link>
          </Button>
        </div>
      </section>

      {/* Featured Suppliers Section */}
      {featuredSuppliers.length > 0 && (
        <section className="mb-8 px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores em Destaque</h2>
            <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {loadingSuppliers ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {[1, 2, 3].map(i => <SkeletonCard key={`featured-skeleton-${i}`} />)}
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <Carousel opts={{
                align: "start",
                loop: featuredSuppliers.length > (isMobile ? 1 : 3)
              }} className="w-full max-w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredSuppliers.map(supplier => (
                    <CarouselItem key={supplier.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 w-full max-w-full">
                      <OptimizedSupplierCard
                        supplier={supplier}
                        isFavorite={isFavorite}
                        onToggleFavorite={handleToggleFavorite}
                        getCategoryName={getCategoryName}
                        getCategoryStyle={getCategoryStyle}
                        formatAvgPrice={formatAvgPrice}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {featuredSuppliers.length > (isMobile ? 1 : 3) && (
                  <>
                    <CarouselPrevious className="left-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
                    <CarouselNext className="right-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white hidden md:flex" />
                  </>
                )}
              </Carousel>
            </div>
          )}
        </section>
      )}

      {/* Recent Suppliers Section */}
      <section className="mb-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gradient">Fornecedores Recentes</h2>
          <Link to="/suppliers" className="text-[#9b87f5] hover:text-[#D946EF] flex items-center gap-1 transition-colors text-sm font-medium">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {loadingSuppliers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={`recent-skeleton-${i}`} />)}
          </div>
        ) : recentSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-full overflow-x-auto">
            {recentSuppliers.map(supplier => (
              <div key={supplier.id} className="animate-fade-in w-full max-w-full">
                <OptimizedSupplierCard
                  supplier={supplier}
                  isFavorite={isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  getCategoryName={getCategoryName}
                  getCategoryStyle={getCategoryStyle}
                  formatAvgPrice={formatAvgPrice}
                />
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
      
      {/* Recent Articles Section */}
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
    </AppLayout>
  );
}
