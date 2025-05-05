
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { fetchSuppliers, fetchCategories } from '@/services/supplierService';
import { Supplier, Category } from '@/types/supplier';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Instagram, MapPin, ShoppingBag, Star, Search, Filter } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function SuppliersList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'featured'>('all');
  
  // Carregar dados na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar categorias e fornecedores
        const [categoriesData, suppliersData] = await Promise.all([
          fetchCategories(),
          fetchSuppliers()
        ]);
        
        setCategories(categoriesData);
        setSuppliers(suppliersData);
        setFilteredSuppliers(suppliersData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Aplicar filtros quando os parâmetros de filtragem mudam
  useEffect(() => {
    let filtered = suppliers;
    
    // Filtrar por aba (todos ou destacados)
    if (selectedTab === 'featured') {
      filtered = filtered.filter(supplier => supplier.featured);
    }
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplier => 
        supplier.categories.includes(selectedCategory)
      );
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(term) ||
        supplier.description.toLowerCase().includes(term) ||
        supplier.city.toLowerCase().includes(term) ||
        supplier.state.toLowerCase().includes(term)
      );
    }
    
    setFilteredSuppliers(filtered);
  }, [suppliers, selectedTab, selectedCategory, searchTerm]);
  
  // Obter nome da categoria a partir do ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };
  
  // Renderizar placeholders de carregamento
  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="w-full h-10 animate-pulse bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 animate-pulse bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Renderizar mensagem de erro
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground">
            Encontre os melhores fornecedores para o seu negócio
          </p>
        </div>
        
        {/* Filtros */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all" value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'all' | 'featured')}>
            <TabsList className="grid w-full max-w-xs grid-cols-2">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="featured">
                <Star className="mr-2 h-4 w-4 fill-current" />
                Destaques
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Resultados */}
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mt-1">
              Tente ajustar seus filtros ou buscar por outro termo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(supplier => (
              <Link to={`/suppliers/${supplier.id}`} key={supplier.id}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {supplier.images && supplier.images.length > 0 ? (
                      <img 
                        src={supplier.images[0]} 
                        alt={supplier.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <ShoppingBag className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {supplier.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                          Destaque
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg line-clamp-1">{supplier.name}</h3>
                    
                    <div className="mt-2 flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{supplier.city}, {supplier.state}</span>
                    </div>
                    
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {supplier.description}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {supplier.categories.slice(0, 3).map(categoryId => (
                        <Badge key={categoryId} variant="outline" className="text-xs">
                          {getCategoryName(categoryId)}
                        </Badge>
                      ))}
                      {supplier.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{supplier.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between">
                    {supplier.instagram && (
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Instagram className="h-4 w-4 mr-1" />
                        {supplier.instagram}
                      </span>
                    )}
                    
                    <Button variant="ghost" size="sm" className="ml-auto text-primary">
                      Ver detalhes
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
