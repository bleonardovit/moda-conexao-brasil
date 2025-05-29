
import { useState, useEffect } from 'react';
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
  // Mail, // Mail icon was imported but not used in the provided snippet
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  // CardDescription, // Not used in the provided snippet
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
import { Input } from '@/components/ui/input'; // Not used in the provided snippet, but kept for consistency
import type { Supplier, Review, Category } from '@/types';
import { getSupplierById } from '@/services/supplierService';
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

export default function SupplierDetail() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { favorites, toggleFavorite, isFavorite } = useFavorites(); // favorites state is not directly used, but hooks are kept
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  const { isInTrial, isSupplierAllowed } = useTrialStatus();
  const [isAccessible, setIsAccessible] = useState(true);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });
  
  useEffect(() => {
    if (supplierId) {
      const fetchSupplierDetailsAndReviews = async () => {
        setLoading(true);
        setError(null);
        setReviews([]);
        try {
          const fetchedSupplier = await getSupplierById(supplierId, user?.id);
          if (fetchedSupplier) {
            setSupplier(fetchedSupplier);

            if (isInTrial && user?.id) {
              const hasAccess = await isSupplierAllowed(supplierId);
              setIsAccessible(hasAccess);
            } else {
              setIsAccessible(true); // Not in trial or no user, so accessible by default for trial logic
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
      setReviews([]);
    }
  }, [supplierId, toast, user?.id, isInTrial, isSupplierAllowed]);
  
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

  const getCategoryNameFromId = (categoryId: string): string => {
    const foundCategory = allCategories.find(cat => cat.id === categoryId);
    return foundCategory ? foundCategory.name : categoryId;
  };

  const goToPreviousSupplier = () => {
    toast({ title: "Navegação indisponível", description: "A navegação para fornecedor anterior/seguinte está temporariamente desabilitada.", duration: 3000 });
  };
  
  const goToNextSupplier = () => {
    toast({ title: "Navegação indisponível", description: "A navegação para fornecedor anterior/seguinte está temporariamente desabilitada.", duration: 3000 });
  };
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
    
  const ratingDistribution: number[] = [0, 0, 0, 0, 0]; // Explicitly typed
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
      
      // Note: isFavorite(supplier.id) will reflect the state *before* the toggle in the same render cycle.
      // So, if it *was* favorite, it's now unfavorited.
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
      form.reset({ rating: 0, comment: "" }); // Reset form with default values
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
  
  if (loading) {
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
      <div className="container mx-auto px-4 py-8"> {/* Added container and padding */}
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
                disabled // Kept disabled as per user's code
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSupplier}
                disabled // Kept disabled as per user's code
                className="h-8 w-8"
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
                    onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : supplier.images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 text-foreground rounded-full h-8 w-8"
                    aria-label="Imagem anterior"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setActiveImageIndex(prev => (prev < supplier.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 text-foreground rounded-full h-8 w-8"
                    aria-label="Próxima imagem"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {supplier.images && supplier.images.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {supplier.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded-md border-2 ${
                      index === activeImageIndex ? 'border-primary ring-2 ring-primary' : 'border-transparent'
                    } hover:opacity-80 transition-opacity`}
                    onClick={() => setActiveImageIndex(index)}
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
                      // Add more as needed
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
          
          {/* Similar suppliers section - kept commented as per user's code */}
          {/*
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Fornecedores similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              // MOCK_SUPPLIERS.filter(s => 
              //   s.id !== supplier.id && 
              //   s.categories.some(c => supplier.categories.includes(c))
              // ).slice(0, 2).map(similar => (
              //   <Card key={similar.id} className="overflow-hidden card-hover">
              //     <div className="flex h-32">
              //       <div className="w-1/3 bg-muted">
              //         <img 
              //           src={similar.images[0]} 
              //           alt={similar.name}
              //           className="w-full h-full object-cover"
              //         />
              //       </div>
              //       <div className="w-2/3 p-3">
              //         <h3 className="font-medium text-sm">{similar.name}</h3>
              //         <p className="text-xs text-muted-foreground mb-1">
              //           {similar.city}, {similar.state}
              //         </p>
              //         <div className="flex flex-wrap gap-1 mb-2">
              //           {similar.categories.map(category => (
              //             <Badge key={category} variant="outline" className="text-xs">
              //               {category}
              //             </Badge>
              //           ))}
              //         </div>
              //         <Button 
              //           size="sm" 
              //           variant="link" 
              //           className="p-0 h-auto text-primary"
              //           onClick={() => navigate(`/suppliers/${similar.id}`)}
              //         >
              //           Ver detalhes
              //         </Button>
              //       </div>
              //     </div>
              //   </Card>
              // ))
            </div>
          </div>
          */}
        </div>
      </div>
    </AppLayout>
  );
}
