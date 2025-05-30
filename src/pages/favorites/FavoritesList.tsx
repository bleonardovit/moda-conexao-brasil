
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/use-favorites';
import { getSupplierById } from '@/services/supplierService';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { FeatureLimitedAccess } from '@/components/trial/FeatureLimitedAccess';
import { Button } from '@/components/ui/button';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { Heart, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from '@/types';

export default function FavoritesList() {
  const { favorites, removeFavorite, isLoading: isLoadingFavoritesHook } = useFavorites(); // Get isLoading from hook
  const [favoriteSuppliers, setFavoriteSuppliers] = useState<Supplier[]>([]);
  const [isLoadingPageContent, setIsLoadingPageContent] = useState(true); // For fetching supplier details
  const { toast } = useToast();
  const { isInTrial, isFeatureAllowed, hasExpired } = useTrialStatus(); // Added hasExpired
  const [canAccessFeature, setCanAccessFeature] = useState<boolean | null>(null); // Init with null

  const getAccessDeniedMessage = useCallback(() => {
    if (hasExpired) {
      return "Seu período de teste expirou. Assine para acessar e gerenciar seus favoritos.";
    }
    return "A funcionalidade de favoritos é exclusiva para assinantes. Assine um plano para começar a salvar seus fornecedores preferidos.";
  }, [hasExpired]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await isFeatureAllowed('favorites');
      setCanAccessFeature(hasAccess);
    };
    checkAccess();
  }, [isFeatureAllowed]);

  useEffect(() => {
    const fetchFavoriteSuppliers = async () => {
      if (canAccessFeature === false || isLoadingFavoritesHook) {
        // If no access or favorites hook still loading, don't fetch details
        // If favorites hook finished and cleared favorites due to no access, this will also not run.
        setIsLoadingPageContent(false);
        if(canAccessFeature === false) setFavoriteSuppliers([]); // Clear suppliers if access denied
        return;
      }
      
      // Only proceed if canAccessFeature is true
      if (canAccessFeature === true) {
        setIsLoadingPageContent(true);
        try {
          const suppliers: Supplier[] = [];
          for (const favoriteId of favorites) {
            try {
              // Pass user?.id to getSupplierById for consistent trial locking logic
              // However, if the supplier is favorited, it implies it was accessible at some point.
              // The primary lock here is on the favorites feature itself.
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
            title: "Erro ao carregar detalhes dos favoritos",
            description: "Não foi possível carregar os detalhes dos seus fornecedores favoritos.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingPageContent(false);
        }
      }
    };
    
    // Run if canAccessFeature is determined and not loading from favorites hook
    if (canAccessFeature !== null && !isLoadingFavoritesHook) {
      fetchFavoriteSuppliers();
    }
  }, [favorites, toast, canAccessFeature, isLoadingFavoritesHook]);

  const handleRemoveFavorite = (supplierId: string) => {
    removeFavorite(supplierId); // This now has access checks within useFavorites
    // Optimistic update handled by useFavorites re-triggering useEffect
    toast({
      title: "Removido dos favoritos",
      description: "Fornecedor removido dos seus favoritos"
    });
  };
  
  // Overall loading state: page is loading if access check is pending OR favorites hook is loading OR page content is loading
  const isLoading = canAccessFeature === null || isLoadingFavoritesHook || isLoadingPageContent;

  if (canAccessFeature === false && canAccessFeature !== null) { // Ensure check is complete
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6 px-4"> {/* Added px-4 for consistency */}
          <TrialBanner />
          <FeatureLimitedAccess 
            title="Favoritos Indisponíveis" 
            message={getAccessDeniedMessage()}
            // featureName="favoritos" // Not strictly needed if message is comprehensive
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6"> {/* Added container and padding */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meus Favoritos</h1>
        </div>
        
        <TrialBanner /> {/* Consider conditional rendering based on isInTrial */}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
            <p className="ml-2 text-muted-foreground">Carregando seus favoritos...</p>
          </div>
        ) : favoriteSuppliers.length === 0 ? (
          <div className="bg-card text-card-foreground rounded-lg shadow p-8 text-center border"> {/* Adjusted styling */}
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Nenhum favorito adicionado</h2>
            <p className="text-muted-foreground mb-6">
              Você ainda não adicionou nenhum fornecedor aos favoritos. Explore e adicione os que mais gostar!
            </p>
            <Button asChild>
              <Link to="/suppliers">Ver fornecedores</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-card text-card-foreground rounded-lg shadow overflow-hidden border"> {/* Adjusted styling */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* If supplier is locked due to trial, link might lead to locked page, which is fine */}
                    <Link to={`/suppliers/${supplier.id}`} className="hover:underline">
                      <h3 className="text-lg font-semibold">{supplier.name}</h3>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => handleRemoveFavorite(supplier.id)}
                      aria-label="Remover dos favoritos"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : 'Localização não informada'}
                  </p>
                  {/* Display placeholder if supplier data is locked */}
                  <p className="mt-2 line-clamp-2 text-sm"> 
                    {supplier.isLockedForTrial ? "Detalhes disponíveis apenas para assinantes." : supplier.description}
                  </p>
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
