import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Star, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useFavorites } from '@/hooks/use-favorites';
import { useIsMobile } from '@/hooks/use-mobile';
import { Supplier } from '@/types';
import { Article, DEFAULT_CATEGORIES } from '@/types/article';

// Mock data for suppliers
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    code: "SUP001",
    name: "Têxtil Brasil",
    description: "Fabricante de tecidos de alta qualidade para confecção.",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"],
    instagram: "@textilbrasil",
    whatsapp: "+5511999999999",
    website: "https://textilbrasil.com.br",
    min_order: "R$ 500,00",
    payment_methods: ["pix", "card", "bankslip"],
    requires_cnpj: true,
    avg_price: "medium",
    shipping_methods: ["correios", "transporter"],
    city: "São Paulo",
    state: "SP",
    categories: ["Têxtil", "Tecidos"],
    featured: true,
    hidden: false,
    created_at: "2025-04-01T10:30:00Z",
    updated_at: "2025-04-15T14:22:00Z"
  },
  {
    id: "2",
    code: "SUP002",
    name: "Moda Express",
    description: "Atacadista de roupas prontas com entrega rápida.",
    images: ["https://images.unsplash.com/photo-1649972904349-6e44c42644a7"],
    instagram: "@modaexpress",
    whatsapp: "+5511888888888",
    website: "https://modaexpress.com.br",
    min_order: "R$ 1.000,00",
    payment_methods: ["pix", "card"],
    requires_cnpj: true,
    avg_price: "low",
    shipping_methods: ["delivery", "transporter"],
    city: "Rio de Janeiro",
    state: "RJ",
    categories: ["Moda", "Atacado"],
    featured: false,
    hidden: false,
    created_at: "2025-04-10T08:15:00Z",
    updated_at: "2025-04-20T11:45:00Z"
  },
  {
    id: "3",
    code: "SUP003",
    name: "Joias Finas",
    description: "Atacadista de joias e acessórios de alta qualidade.",
    images: ["https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"],
    instagram: "@joiasfinas",
    whatsapp: "+5511777777777",
    website: "https://joiasfinas.com.br",
    min_order: "R$ 2.000,00",
    payment_methods: ["pix", "bankslip"],
    requires_cnpj: true,
    avg_price: "high",
    shipping_methods: ["correios"],
    city: "Belo Horizonte",
    state: "MG",
    categories: ["Acessórios", "Joias"],
    featured: true,
    hidden: false,
    created_at: "2025-04-05T15:20:00Z",
    updated_at: "2025-04-18T09:30:00Z"
  },
  {
    id: "4",
    code: "SUP004",
    name: "Calçados Brasil",
    description: "Fabricante de calçados para todos os estilos e ocasiões.",
    images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb"],
    instagram: "@calcadosbrasil",
    whatsapp: "+5511666666666",
    website: "https://calcadosbrasil.com.br",
    min_order: "R$ 1.500,00",
    payment_methods: ["card", "bankslip"],
    requires_cnpj: false,
    avg_price: "medium",
    shipping_methods: ["correios", "transporter"],
    city: "Franca",
    state: "SP",
    categories: ["Calçados", "Couro"],
    featured: false,
    hidden: false,
    created_at: "2025-04-15T12:10:00Z",
    updated_at: "2025-04-22T16:40:00Z"
  },
  {
    id: "5",
    code: "SUP005",
    name: "Cosméticos Naturais",
    description: "Produtos cosméticos naturais e orgânicos.",
    images: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5"],
    instagram: "@cosmeticosnaturais",
    whatsapp: "+5511555555555",
    website: "https://cosmeticosnaturais.com.br",
    min_order: "R$ 800,00",
    payment_methods: ["pix", "card"],
    requires_cnpj: false,
    avg_price: "medium",
    shipping_methods: ["correios"],
    city: "Florianópolis",
    state: "SC",
    categories: ["Cosméticos", "Beleza"],
    featured: true,
    hidden: false,
    created_at: "2025-04-20T10:00:00Z",
    updated_at: "2025-04-25T14:15:00Z"
  }
];

// Mock data for articles
const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Como encontrar os melhores fornecedores",
    summary: "Descubra as melhores estratégias para encontrar fornecedores confiáveis para o seu negócio.",
    content: "Neste artigo, vamos explorar as melhores estratégias para encontrar fornecedores confiáveis...",
    category: "marketing",
    author: "Maria Silva",
    created_at: "2025-04-10T14:30:00Z",
    image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
    published: true
  },
  {
    id: "2",
    title: "Negociando com fornecedores: dicas essenciais",
    summary: "Aprenda técnicas eficazes de negociação para obter melhores condições com seus fornecedores.",
    content: "A negociação com fornecedores é uma habilidade crucial para qualquer empresário...",
    category: "finance",
    author: "João Santos",
    created_at: "2025-04-12T09:45:00Z",
    image_url: "https://images.unsplash.com/photo-1573164713988-8665fc963095",
    published: true
  },
  {
    id: "3",
    title: "Tendências do mercado de fornecimento para 2025",
    summary: "Conheça as principais tendências que estão moldando o mercado de fornecimento em 2025.",
    content: "O mercado de fornecimento está em constante evolução. Neste artigo, analisamos as principais tendências...",
    category: "entrepreneurship",
    author: "Ana Lima",
    created_at: "2025-04-15T11:20:00Z",
    image_url: "https://images.unsplash.com/photo-1664575599618-8f6bd76fc670",
    published: true
  }
];

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
          src={supplier.images[0]} 
          alt={supplier.name} 
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}
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
          {supplier.categories.slice(0, 2).map(category => (
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

export default function Home() {
  const isMobile = useIsMobile();
  
  // Sort suppliers by creation date (recent first) and featured status
  const recentSuppliers = [...MOCK_SUPPLIERS].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4);
  
  const popularSuppliers = MOCK_SUPPLIERS.filter(supplier => supplier.featured);
  
  // Get recent articles
  const recentArticles = [...MOCK_ARTICLES].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 3);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-full overflow-x-auto">
          {recentSuppliers.map(supplier => (
            <div key={supplier.id} className="animate-fade-in w-full max-w-full">
              <SupplierCard supplier={supplier} />
            </div>
          ))}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-full overflow-x-auto">
          {recentArticles.map(article => (
            <div key={article.id} className="animate-fade-in w-full max-w-full">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
