
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/use-favorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Supplier } from '@/types';
import { Article } from '@/types/article';
import { Category } from '@/types';
import { getOptimizedHomeSuppiers } from '@/services/supplier/optimizedHomeQueries';
import { getArticles } from '@/services/articleService';
import { getCategories } from '@/services/categoryService';
// Seções e helpers refatorados:
import { FeaturedSuppliersSection } from './home/FeaturedSuppliersSection';
import { RecentSuppliersSection } from './home/RecentSuppliersSection';
import { RecentArticlesSection } from './home/RecentArticlesSection';
import { getCategoryName, getCategoryStyle, formatAvgPrice } from './home/helpers';

export default function Home() {
  const isMobile = useIsMobile();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fornecedores para home com cache
  const {
    data: homeSuppliers,
    isLoading: loadingSuppliers
  } = useQuery({
    queryKey: ['home-suppliers', user?.id],
    queryFn: () => getOptimizedHomeSuppiers(user?.id, 6, 8),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Artigos com cache
  const {
    data: articles,
    isLoading: loadingArticles
  } = useQuery({
    queryKey: ['articles'],
    queryFn: () => getArticles(),
    staleTime: 15 * 60 * 1000,
  });

  // Categorias
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

  // Funções auxiliares
  const getCatName = (categoryId: string) => getCategoryName(allCategories, categoryId);

  const handleToggleFavorite = (supplier: Supplier, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(supplier.id);
  };

  // Extrair suppliers otimizados
  const featuredSuppliers = homeSuppliers?.featuredSuppliers || [];
  const recentSuppliers = homeSuppliers?.recentSuppliers || [];
  // Artigos recentes
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

      <FeaturedSuppliersSection
        featuredSuppliers={featuredSuppliers}
        loadingSuppliers={loadingSuppliers}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        getCategoryName={getCatName}
        getCategoryStyle={getCategoryStyle}
        formatAvgPrice={formatAvgPrice}
      />

      <RecentSuppliersSection
        recentSuppliers={recentSuppliers}
        loadingSuppliers={loadingSuppliers}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        getCategoryName={getCatName}
        getCategoryStyle={getCategoryStyle}
        formatAvgPrice={formatAvgPrice}
      />

      <RecentArticlesSection
        recentArticles={recentArticles}
        loadingArticles={loadingArticles}
      />
    </AppLayout>
  );
}
