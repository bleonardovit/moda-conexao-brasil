import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Instagram, 
  ArrowLeft,
  ArrowRight, 
  Globe, 
  MessageCircle, 
  Share2, 
  Star,
  Heart,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/use-favorites';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Supplier, Review, Category } from '@/types';
import { getSupplierById, getSuppliers } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { 
  getReviewsBySupplierId, 
  createReview, 
  type CreateReviewData 
} from '@/services/reviewService';
import { useAuth } from '@/hooks/useAuth';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { LockedSupplierDetail } from '@/components/trial/LockedSupplierDetail';

const reviewFormSchema = z.object({
  rating: z.number().min(1, { message: "Selecione pelo menos uma estrela."}).max(5),
  comment: z.string().min(5, {
    message: "A avaliação precisa ter pelo menos 5 caracteres.",
  }),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// Simple type for supplier navigation list items
type NavSupplier = Pick<Supplier, 'id'>;

export default function SupplierDetail() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  const { isInTrial, isSupplierAllowed } = useTrialStatus();
  const [isAccessible, setIsAccessible] = useState(true);

  // State for navigation
  const [allSuppliersForNav, setAllSuppliersForNav] = useState<NavSupplier[]>([]);
  const [isNavListLoading, setIsNavListLoading] = useState<boolean>(true);

  // State for thumbnail window (show only 4 thumbnails at a time)
  const [thumbnailWindowStart, setThumbnailWindowStart] = useState(0);
  const THUMBNAILS_PER_VIEW = 4;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Calculate visible thumbnails window
  const visibleThumbnails = useMemo(() => {
    if (!supplier?.images || supplier.images.length === 0) return [];
    
    const totalImages = supplier.images.length;
    if (totalImages <= THUMBNAILS_PER_VIEW) {
      return supplier.images.map((image, index) => ({ image, index }));
    }
    
    return supplier.images
      .slice(thumbnailWindowStart, thumbnailWindowStart + THUMBNAILS_PER_VIEW)
      .map((image, relativeIndex) => ({ 
        image, 
        index: thumbnailWindowStart + relativeIndex 
      }));
  }, [supplier?.images, thumbnailWindowStart]);

  // Function to update thumbnail window based on active image
  const updateThumbnailWindow = (newActiveIndex: number) => {
    if (!supplier?.images || supplier.images.length <= THUMBNAILS_PER_VIEW) return;
    
    const totalImages = supplier.images.length;
    
    // If active image is outside current window, adjust window
    if (newActiveIndex < thumbnailWindowStart) {
      setThumbnailWindowStart(newActiveIndex);
    } else if (newActiveIndex >= thumbnailWindowStart + THUMBNAILS_PER_VIEW) {
      setThumbnailWindowStart(Math.max(0, Math.min(newActiveIndex - THUMBNAILS_PER_VIEW + 1, totalImages - THUMBNAILS_PER_VIEW)));
    }
  };

  // Function to scroll thumbnails window
  const scrollThumbnailWindow = (direction: 'left' | 'right') => {
    if (!supplier?.images || supplier.images.length <= THUMBNAILS_PER_VIEW) return;
    
    const totalImages = supplier.images.length;
    const maxStart = totalImages - THUMBNAILS_PER_VIEW;
    
    if (direction === 'left') {
      setThumbnailWindowStart(Math.max(0, thumbnailWindowStart - 1));
    } else {
      setThumbnailWindowStart(Math.min(maxStart, thumbnailWindowStart + 1));
    }
  };

  // Check if we can scroll thumbnail window
  const canScrollThumbnailsLeft = thumbnailWindowStart > 0;
  const canScrollThumbnailsRight = supplier?.images && supplier.images.length > THUMBNAILS_PER_VIEW && 
    thumbnailWindowStart < supplier.images.length - THUMBNAILS_PER_VIEW;

  useEffect(() => {
    // Reset states when supplierId changes
    setSupplier(null);
    setLoading(true);
    setError(null);
    setReviews([]);
    setActiveImageIndex(0); // Reset image index
    setThumbnailWindowStart(0); // Reset thumbnail window

    if (supplierId) {
      const fetchSupplierDetailsAndReviews = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedSupplier = await getSupplierById(supplierId, false);
          if (fetchedSupplier) {
            setSupplier(fetchedSupplier);

            if (isInTrial && user?.id) {
              const hasAccess = await isSupplierAllowed(supplierId);
              setIsAccessible(hasAccess);
            } else {
              setIsAccessible(true); 
            }

            setLoadingReviews(true);
            try {
              const fetchedReviews = await getReviewsBySupplierId(supplierId);
              setReviews(fetchedReviews);
            } catch (reviewError) {
              console.error("Erro ao buscar reviews:", reviewError);
              toast({ title: "Erro ao carregar avaliações", variant: "destructive", duration: 3000 });
            } finally {
              setLoadingReviews(false);
            }
          } else {
            setError('Fornecedor não encontrado.');
          }
        } catch (err) {
          console.error("Erro ao buscar detalhes do fornecedor:", err);
          setError('Falha ao carregar dados do fornecedor.');
        } finally {
          setLoading(false);
        }
      };
      fetchSupplierDetailsAndReviews();
    } else {
      setError('ID do fornecedor não fornecido.');
      setLoading(false);
    }
  }, [supplierId, user?.id, isInTrial, isSupplierAllowed, toast]);
  
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

  // Effect for fetching all suppliers for navigation
  useEffect(() => {
    const fetchNavSuppliers = async () => {
      setIsNavListLoading(true);
      try {
        const allSuppliersData = await getSuppliers(user?.id); 
        setAllSuppliersForNav(allSuppliersData.map(s => ({ id: s.id })));
      } catch (err) {
        console.error("Erro ao buscar lista de fornecedores para navegação:", err);
        toast({ title: "Erro ao carregar lista para navegação", variant: "destructive", duration: 3000 });
        setAllSuppliersForNav([]);
      } finally {
        setIsNavListLoading(false);
      }
    };
    fetchNavSuppliers();
  }, [user?.id, toast]);

  const { currentIndex, previousSupplierId, nextSupplierId } = useMemo(() => {
    if (!supplierId || allSuppliersForNav.length === 0) {
      return { currentIndex: -1, previousSupplierId: null, nextSupplierId: null };
    }
    const idx = allSuppliersForNav.findIndex(s => s.id === supplierId);
    if (idx === -1) {
      return { currentIndex: -1, previousSupplierId: null, nextSupplierId: null };
    }
    
    const prevId = idx > 0 ? allSuppliersForNav[idx - 1].id : allSuppliersForNav[allSuppliersForNav.length - 1].id;
    const nextId = idx < allSuppliersForNav.length - 1 ? allSuppliersForNav[idx + 1].id : allSuppliersForNav[0].id;
    
    return {
      currentIndex: idx,
      previousSupplierId: allSuppliersForNav.length > 1 ? prevId : null,
      nextSupplierId: allSuppliersForNav.length > 1 ? nextId : null,
    };
  }, [supplierId, allSuppliersForNav]);

  const goToPreviousSupplier = () => {
    if (previousSupplierId) {
      navigate(`/suppliers/${previousSupplierId}`);
    } else {
      toast({ title: "Navegação", description: "Não há fornecedor anterior ou a lista está carregando.", duration: 2000 });
    }
  };
  
  const goToNextSupplier = () => {
    if (nextSupplierId) {
      navigate(`/suppliers/${nextSupplierId}`);
    } else {
      toast({ title: "Navegação", description: "Não há próximo fornecedor ou a lista está carregando.", duration: 2000 });
    }
  };
  
  const getCategoryNameFromId = (categoryId: string): string => {
    const foundCategory = allCategories.find(cat => cat.id === categoryId);
    return foundCategory ? foundCategory.name : categoryId;
  };
    
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
    
  const ratingDistribution: number[] = [0, 0, 0, 0, 0]; 
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating - 1]++;
    }
  });

  const ratingPercentages = ratingDistribution.map(count => 
    reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
  );
  
  const handleToggleFavorite = () => {
    if (supplier) {
      const currentlyFavorite = isFavorite(supplier.id);
      toggleFavorite(supplier.id); 
      
      const message = !currentlyFavorite
        ? `${supplier.name} adicionado aos favoritos`
        : `${supplier.name} removido dos favoritos`;
        
      toast({
        title: !currentlyFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: message,
        duration: 2000,
      });
    }
  };
  
  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Fornecedor: ${supplier?.name}`,
          text: `Confira este fornecedor: ${supplier?.name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({ title: "Erro ao compartilhar", description: "Não foi possível compartilhar o link.", variant: "destructive", duration: 3000 });
    }
  };
  
  const onSubmitReview = async (data: ReviewFormValues) => {
    if (!isAuthenticated || !user?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado para enviar uma avaliação.", variant: "destructive", duration: 3000 });
      return;
    }
    if (!supplierId) {
      toast({ title: "Erro", description: "ID do fornecedor não encontrado para enviar avaliação.", variant: "destructive", duration: 3000 });
      return;
    }

    const reviewDataToSave: CreateReviewData = {
      supplier_id: supplierId,
      rating: data.rating,
      comment: data.comment,
    };

    try {
      const newReviewFromDb = await createReview(reviewDataToSave, user.id);
      setReviews(prevReviews => [newReviewFromDb, ...prevReviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setIsReviewDialogOpen(false);
      toast({
        title: "Avaliação enviada",
        description: "Obrigado por compartilhar sua opinião!",
        duration: 2000,
      });
      form.reset({ rating: 0, comment: "" }); 
      setSelectedRating(0);
    } catch (err: any) {
      console.error("Erro ao salvar review:", err);
      toast({ 
        title: "Erro ao enviar avaliação", 
        description: err.message || "Ocorreu um problema.", 
        variant: "destructive",
        duration: 3000
      });
    }
  };

  // Enhanced image navigation functions
  const handlePrevImage = () => {
    const newIndex = activeImageIndex > 0 ? activeImageIndex - 1 : (supplier?.images?.length || 1) - 1;
    setActiveImageIndex(newIndex);
    updateThumbnailWindow(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = activeImageIndex < (supplier?.images?.length || 1) - 1 ? activeImageIndex + 1 : 0;
    setActiveImageIndex(newIndex);
    updateThumbnailWindow(newIndex);
  };

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
    updateThumbnailWindow(index);
  };

  if (loading || (isNavListLoading && allSuppliersForNav.length === 0) ) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <p className="text-muted-foreground">Carregando detalhes do fornecedor...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/suppliers')} className="mt-4">
            Voltar para a lista de fornecedores
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Fornecedor não encontrado</h1>
          <Button onClick={() => navigate('/suppliers')} className="mt-4">
            Voltar para a lista de fornecedores
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isInTrial && !isAccessible) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6 px-4">
          <LockedSupplierDetail />
        </div>
      </AppLayout>
    );
  }

  const formatPaymentMethods = (methods: string[] = []) => {
    const mapping: Record<string, string> = {
      'pix': 'PIX',
      'card': 'Cartão',
      'bankslip': 'Boleto'
    };
    return methods.map(m => mapping[m] || m).join(', ') || 'Não informado';
  };
  
  const formatShippingMethods = (methods: string[] = []) => {
    const mapping: Record<string, string> = {
      'correios': 'Correios',
      'transporter': 'Transportadora',
      'delivery': 'Entrega local',
      'excursion': 'Excursão',
      'air': 'Aéreo',
      'custom': supplier.custom_shipping_method || 'Personalizado',
    };
    return methods.map(m => mapping[m] || m).join(', ') || 'Não informado';
  };
  
  const isNewSupplier = () => {
    if (!supplier.created_at) return false;
    const createdDate = new Date(supplier.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/suppliers')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousSupplier}
                disabled={!previousSupplierId || isNavListLoading || allSuppliersForNav.length <=1}
                className="h-8 w-8"
                aria-label="Fornecedor anterior"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSupplier}
                disabled={!nextSupplierId || isNavListLoading || allSuppliersForNav.length <=1}
                className="h-8 w-8"
                aria-label="Próximo fornecedor"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-grow">
              <h1 className="text-2xl md:text-3xl font-bold">{supplier.name}</h1>
              <div className="flex items-center text-muted-foreground gap-2 mb-1 text-sm">
                <MapPin className="h-4 w-4" />
                <p>{supplier.city}, {supplier.state}</p>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Código: {supplier.code}
              </p>
              
              {isNewSupplier() && (
                <Badge className="mt-2 bg-green-500 hover:bg-green-600 text-white">Novo</Badge>
              )}
            </div>
            <Button 
              variant={isFavorite(supplier.id) ? "secondary" : "outline"} 
              size="icon"
              onClick={handleToggleFavorite}
              className="shrink-0"
              aria-label={isFavorite(supplier.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
              />
            </Button>
          </div>
          
          <div className="mt-4 relative">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              {supplier.images && supplier.images.length > 0 ? (
                <img
                  src={supplier.images[activeImageIndex]}
                  alt={`${supplier.name} - Imagem ${activeImageIndex + 1}`}
                  className="h-full w-full object-contain transition-all duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
              )}
              
              {supplier.images && supplier.images.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 text-foreground rounded-full h-8 w-8"
                    aria-label="Imagem anterior"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 text-foreground rounded-full h-8 w-8"
                    aria-label="Próxima imagem"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image counter */}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md text-sm">
                    {activeImageIndex + 1}/{supplier.images.length}
                  </div>
                </>
              )}
            </div>
            
            {supplier.images && supplier.images.length > 1 && (
              <div className="mt-2 relative">
                {/* Thumbnail scroll indicators */}
                {canScrollThumbnailsLeft && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-6 w-6 bg-background/80 hover:bg-background/90 rounded-full shadow-sm"
                    onClick={() => scrollThumbnailWindow('left')}
                    aria-label="Ver imagens anteriores"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                )}
                
                {canScrollThumbnailsRight && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-6 w-6 bg-background/80 hover:bg-background/90 rounded-full shadow-sm"
                    onClick={() => scrollThumbnailWindow('right')}
                    aria-label="Ver próximas imagens"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                )}
                
                {/* Fixed container that shows exactly 4 thumbnails */}
                <div className="overflow-hidden">
                  <div 
                    className="flex gap-2 transition-all duration-300"
                    style={{ 
                      width: `${THUMBNAILS_PER_VIEW * 72}px`, // 64px width + 8px gap = 72px per thumbnail
                      margin: '0 auto'
                    }}
                  >
                    {visibleThumbnails.map(({ image, index }) => (
                      <button
                        key={index}
                        type="button"
                        className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded-md border-2 transition-all duration-200 ${
                          index === activeImageIndex 
                            ? 'border-primary ring-2 ring-primary shadow-md' 
                            : 'border-transparent hover:border-muted-foreground/30'
                        } hover:opacity-80`}
                        onClick={() => handleThumbnailClick(index)}
                        aria-label={`Ver imagem ${index + 1}`}
                      >
                        <img
                          src={image}
                          alt={`${supplier.name} - Thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {reviews.length > 0 && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {supplier.instagram && (
              <Button variant="outline" asChild>
                <a 
                  href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  Instagram
                </a>
              </Button>
            )}
            
            {supplier.whatsapp && (
              <Button variant="outline" asChild>
                <a 
                  href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </a>
              </Button>
            )}
            
            {supplier.website && (
              <Button variant="outline" asChild>
                <a 
                  href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Site
                </a>
              </Button>
            )}
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-5 w-5" />
              Compartilhar
            </Button>
          </div>
          
          <Tabs defaultValue="info" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="conditions">Condições</TabsTrigger>
              <TabsTrigger value="reviews">
                {reviews.length > 0 ? `(${reviews.length}) Avaliações` : 'Avaliações'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {supplier.description || "Nenhuma descrição fornecida."}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.categories && supplier.categories.length > 0 ? supplier.categories.map(categoryId => {
                    const categoryName = getCategoryNameFromId(categoryId);
                    const categoryColors: Record<string, string> = {
                      'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                      'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                      'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                      'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
                      'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
                    };
                    
                    return (
                      <Badge 
                        key={categoryId}
                        variant="outline"
                        className={`px-2 py-1 text-xs ${categoryColors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        {categoryName}
                      </Badge>
                    );
                  }) : <p className="text-sm text-muted-foreground">Nenhuma categoria informada.</p>}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Desde</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long'
                    }) : 'Data não informada'}
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Pedido Mínimo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{supplier.min_order || "Não informado"}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formatPaymentMethods(supplier.payment_methods)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Exige CNPJ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{supplier.requires_cnpj ? 'Sim' : 'Não'}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Envio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formatShippingMethods(supplier.shipping_methods)}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6 py-4">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="w-full lg:w-1/3 space-y-3 bg-muted/50 dark:bg-muted/20 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {loadingReviews ? 'Carregando...' : `${reviews.length} avaliação${reviews.length !== 1 ? 's' : ''}`}
                    </div>
                    
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mb-4" disabled={!isAuthenticated || !supplier}>
                          {isAuthenticated ? (supplier ? `Avalie ${supplier.name.substring(0,15)}${supplier.name.length > 15 ? '...' : ''}`: 'Carregando...') : 'Faça login para avaliar'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Avalie {supplier.name}</DialogTitle>
                          <DialogDescription>
                            Compartilhe sua experiência com este fornecedor para ajudar outros compradores.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sua nota</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Button
                                          key={star}
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            setSelectedRating(star);
                                            field.onChange(star);
                                          }}
                                          aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                                        >
                                          <Star
                                            className={`h-6 w-6 transition-colors ${
                                              star <= selectedRating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-muted-foreground hover:text-yellow-400'
                                            }`}
                                          />
                                        </Button>
                                      ))}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="comment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Seu comentário</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Conte sua experiência com este fornecedor..."
                                      className="resize-none"
                                      rows={4}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end gap-2 pt-2">
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                  setIsReviewDialogOpen(false);
                                  form.reset({ rating: 0, comment: ""});
                                  setSelectedRating(0);
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Enviando..." : "Enviar avaliação"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {reviews.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <h4 className="text-sm font-medium text-center mb-2">Distribuição</h4>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 text-xs">
                          <div className="flex items-center w-10">
                            <span>{rating}</span>
                            <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400" 
                              style={{width: `${ratingPercentages[rating - 1]}%`}}
                            ></div>
                          </div>
                          <span className="w-8 text-right text-muted-foreground">
                            {ratingPercentages[rating - 1]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full lg:w-2/3">
                  {loadingReviews && <div className="text-center py-8"><p className="text-muted-foreground">Carregando avaliações...</p></div>}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="text-center py-10 bg-muted/30 dark:bg-muted/10 rounded-lg">
                      <p className="text-muted-foreground mb-3">
                        Este fornecedor ainda não possui avaliações.
                      </p>
                      <Button onClick={() => setIsReviewDialogOpen(true)} disabled={!isAuthenticated || !supplier}>
                        {isAuthenticated ? (supplier ? 'Seja o primeiro a avaliar!' : 'Carregando...') : 'Faça login para avaliar'}
                      </Button>
                    </div>
                  )}
                  {reviews.length > 0 && (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="font-medium text-sm">{review.user_name || 'Usuário'}</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
                          <div className="text-xs text-muted-foreground/80 mt-2">
                            {new Date(review.created_at).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
