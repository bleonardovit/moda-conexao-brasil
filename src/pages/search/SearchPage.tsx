import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { searchSuppliers } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
// Import components for trial limitations
import { useTrialStatus } from '@/hooks/use-trial-status';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { LimitedSearch } from './LimitedSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import type { Category, Supplier } from '@/types';

const SearchPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Add trial status check
  const { isInTrial, isFeatureAllowed } = useTrialStatus();
  const [canAccessFeature, setCanAccessFeature] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Check if search is accessible in trial
  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (isInTrial) {
        const hasAccess = await isFeatureAllowed('advanced_search');
        setCanAccessFeature(hasAccess);
      }
    };
    
    checkFeatureAccess();
  }, [isInTrial, isFeatureAllowed]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!canAccessFeature) return;
      
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, [canAccessFeature]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsLoading(true);
    try {
      const results = await searchSuppliers({ searchTerm });
      setSuppliers(results);
    } catch (error) {
      console.error('Error searching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If in trial mode and feature is not accessible, show limited version
  if (isInTrial && !canAccessFeature) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6">
          <TrialBanner />
          <LimitedSearch />
        </div>
      </AppLayout>
    );
  }

  // Regular search page for users with access
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Busca Avançada</h1>
        </div>
        
        <TrialBanner />
        
        <div className="flex gap-2">
          <Input 
            placeholder="Digite sua busca..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Categoria</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as categorias" />
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
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Carregando resultados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suppliers.length > 0 ? (
              suppliers.map(supplier => (
                <Card key={supplier.id} className="overflow-hidden card-hover">
                  <div className="sm:flex">
                    <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
                      <img
                        src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
                        alt={supplier.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="sm:w-2/3 md:w-3/4 p-4">
                      <h3 className="text-lg font-bold">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.state}</p>
                      <p className="text-sm mt-2 line-clamp-2">{supplier.description}</p>
                      <div className="mt-4">
                        <Button asChild size="sm">
                          <Link to={`/suppliers/${supplier.id}`}>Ver detalhes</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum fornecedor encontrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchPage;
