import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/use-favorites';
import { getSupplierById } from '@/services/supplierService';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { FeatureLimitedAccess } from '@/components/trial/FeatureLimitedAccess';
import { Button } from '@/components/ui/button';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { Heart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from '@/types';

export default function FavoritesList() {
  const { favorites, removeFavorite } = useFavorites();
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isInTrial, isFeatureAllowed } = useTrialStatus();
  const [canAccessFeature, setCanAccessFeature] = useState(true);

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (isInTrial) {
        const hasAccess = await isFeatureAllowed('favorites');
        setCanAccessFeature(hasAccess);
      }
    };
    
    checkFeatureAccess();
  }, [isInTrial, isFeatureAllowed]);

  useEffect(() => {
    const fetchFavoriteSuppliers = async () => {
      if (!canAccessFeature) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const suppliers: Supplier[] = [];
        
        for (const favoriteId of favorites) {
          try {
            const supplier = await getSupplierById(favoriteId);
            if (supplier) {
              suppliers.push(supplier);
            }
          } catch (error) {
            console.error(`Error fetching supplier ${favoriteId}:`, error);
          }
        }
        
        setFavoriteSuppliers(suppliers);
      } catch (error) {
        console.error('Error fetching favorite suppliers:', error);
        toast({
          title: "Erro ao carregar favoritos",
          description: "Não foi possível carregar seus favoritos. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavoriteSuppliers();
  }, [favorites, toast, canAccessFeature]);

  const handleRemoveFavorite = (supplierId: string) => {
    removeFavorite(supplierId);
    setFavoriteSuppliers(prev => prev.filter(s => s.id !== supplierId));
    toast({
      title: "Removido dos favoritos",
      description: "Fornecedor removido dos seus favoritos"
    });
  };

  if (!canAccessFeature) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6">
          <TrialBanner />
          <FeatureLimitedAccess 
            title="Favoritos Indisponíveis" 
            message="Durante o período de teste gratuito, o recurso de favoritos está disponível apenas para assinantes." 
            featureName="favoritos"
          />
        </div>
      </AppLayout>
    );
  }

  // Rest of the component for users with access
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meus Favoritos</h1>
        </div>
        
        <TrialBanner />
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando favoritos...</p>
          </div>
        ) : favoriteSuppliers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito adicionado</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Você ainda não adicionou nenhum fornecedor aos favoritos.</p>
            <Button asChild>
              <Link to="/suppliers">Ver fornecedores</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <Link to={`/suppliers/${supplier.id}`} className="hover:underline">
                      <h3 className="text-lg font-semibold">{supplier.name}</h3>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => handleRemoveFavorite(supplier.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remover dos favoritos</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{supplier.city}, {supplier.state}</p>
                  <p className="mt-2 line-clamp-2">{supplier.description}</p>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link to={`/suppliers/${supplier.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
