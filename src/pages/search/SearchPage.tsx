import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getArticles } from '@/services/articleService';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { DEFAULT_CATEGORIES } from '@/types/article';
import { Supplier } from '@/types';
import { Search as SearchIcon } from 'lucide-react';

// Placeholder para o serviço de fornecedores
const getSuppliers = (searchTerm?: string): Supplier[] => {
  // Mock data de fornecedores
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
    // ... outros fornecedores
  ];

  if (!searchTerm) return MOCK_SUPPLIERS;
  
  const term = searchTerm.toLowerCase();
  return MOCK_SUPPLIERS.filter(supplier => 
    supplier.name.toLowerCase().includes(term) || 
    supplier.description.toLowerCase().includes(term) || 
    supplier.categories.some(cat => cat.toLowerCase().includes(term))
  );
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  
  // Pegar dados filtrados
  const articles = getArticles().filter(article => 
    article.published && (
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const suppliers = getSuppliers(searchQuery);

  // Conteúdo combinado para a aba "Todos"
  const allResults = [...suppliers, ...articles];
  const hasResults = allResults.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar fornecedores e artigos..."
              className="pl-10 pr-24 h-12 w-full bg-background/80 border-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-brand-purple/70 hover:bg-brand-purple"
            >
              Buscar
            </Button>
          </div>
        </form>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="articles">Artigos</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {!hasResults && searchQuery && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">Nenhum resultado encontrado para "{searchQuery}"</p>
              </div>
            )}
            
            {suppliers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Fornecedores</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suppliers.slice(0, 3).map(supplier => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                </div>
              </div>
            )}
            
            {articles.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Artigos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map(article => (
                    <ArticleCard 
                      key={article.id} 
                      article={article} 
                      categories={DEFAULT_CATEGORIES}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.length > 0 ? (
                suppliers.map(supplier => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    {searchQuery 
                      ? `Nenhum fornecedor encontrado para "${searchQuery}"` 
                      : "Digite algo para buscar fornecedores"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="articles">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.length > 0 ? (
                articles.map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    categories={DEFAULT_CATEGORIES}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    {searchQuery 
                      ? `Nenhum artigo encontrado para "${searchQuery}"` 
                      : "Digite algo para buscar artigos"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

// Componente de Card de Fornecedor para a página de busca
function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow glass-morphism">
      {supplier.images?.[0] && (
        <div className="relative h-32">
          <img 
            src={supplier.images[0]} 
            alt={supplier.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold mb-1">{supplier.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{supplier.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {supplier.categories.map(category => (
            <span key={category} className="text-xs px-2 py-1 bg-muted rounded-full">
              {category}
            </span>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{supplier.city}, {supplier.state}</span>
          <Button variant="link" className="p-0 h-auto text-brand-purple" asChild>
            <a href={`/suppliers/${supplier.id}`}>Ver detalhes</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
