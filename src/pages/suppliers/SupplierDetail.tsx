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
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { Input } from '@/components/ui/input';
import type { Supplier, Review, Category } from '@/types';
import { getSupplierById } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { 
  getReviewsBySupplierId, 
  createReview, 
  type CreateReviewData 
} from '@/services/reviewService';
import { useAuth } from '@/hooks/useAuth';

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
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
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

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
          const fetchedSupplier = await getSupplierById(supplierId);
          if (fetchedSupplier) {
            setSupplier(fetchedSupplier);
            setLoadingReviews(true);
            try {
              const fetchedReviews = await getReviewsBySupplierId(supplierId);
              setReviews(fetchedReviews);
            } catch (reviewError) {
              console.error("Erro ao buscar reviews:", reviewError);
              toast({ title: "Erro ao carregar avaliações", variant: "destructive" });
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
  }, [supplierId, toast]);
  
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
    toast({ title: "Navegação indisponível", description: "A navegação para fornecedor anterior/seguinte está temporariamente desabilitada." });
  };
  
  const goToNextSupplier = () => {
    toast({ title: "Navegação indisponível", description: "A navegação para fornecedor anterior/seguinte está temporariamente desabilitada." });
  };
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
    
  const ratingDistribution = [0, 0, 0, 0, 0];
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
      toggleFavorite(supplier.id);
      
      const message = isFavorite(supplier.id)
        ? `${supplier.name} removido dos favoritos`
        : `${supplier.name} adicionado aos favoritos`;
        
      toast({
        title: isFavorite(supplier.id) ? "Removido dos favoritos" : "Adicionado aos favoritos",
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
    }
  };
  
  const onSubmitReview = async (data: ReviewFormValues) => {
    if (!isAuthenticated || !user?.id) {
      toast({ title: "Não autenticado", description: "Você precisa estar logado para enviar uma avaliação.", variant: "destructive" });
      return;
    }
    if (!supplierId) {
      toast({ title: "Erro", description: "ID do fornecedor não encontrado para enviar avaliação.", variant: "destructive" });
      return;
    }

    const reviewDataToSave: CreateReviewData = {
      supplier_id: supplierId,
      rating: data.rating,
      comment: data.comment,
    };

    try {
      const newReviewFromDb = await createReview(reviewDataToSave, user.id);
      setReviews(prevReviews => [newReviewFromDb, ...prevReviews]);
      setIsReviewDialogOpen(false);
      toast({
        title: "Avaliação enviada",
        description: "Obrigado por compartilhar sua opinião!",
        duration: 2000,
      });
      form.reset();
      setSelectedRating(0);
    } catch (err: any) {
      console.error("Erro ao salvar review:", err);
      toast({ 
        title: "Erro ao enviar avaliação", 
        description: err.message || "Ocorreu um problema.", 
        variant: "destructive" 
      });
    }
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
          <p>Carregando detalhes do fornecedor...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro</h1>
          <p>{error}</p>
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

  const formatPaymentMethods = (methods: string[]) => {
    const mapping: Record<string, string> = {
      'pix': 'PIX',
      'card': 'Cartão',
      'bankslip': 'Boleto'
    };
    return methods.map(m => mapping[m] || m).join(', ');
  };
  
  const formatShippingMethods = (methods: string[]) => {
    const mapping: Record<string, string> = {
      'correios': 'Correios',
      'transporter': 'Transportadora',
      'delivery': 'Entrega local'
    };
    return methods.map(m => mapping[m] || m).join(', ');
  };
  
  const isNew = () => {
    const createdDate = new Date(supplier.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousSupplier}
              disabled
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextSupplier}
              disabled
              className="h-8 w-8"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <div className="flex items-center text-muted-foreground gap-2 mb-1">
              <MapPin className="h-4 w-4" />
              <p>{supplier.city}, {supplier.state}</p>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Código: {supplier.code}
            </p>
            
            {isNew() && (
              <Badge className="mt-2 bg-green-500 hover:bg-green-600">Novo</Badge>
            )}
          </div>
          <Button 
            variant={isFavorite(supplier.id) ? "secondary" : "outline"} 
            size="icon"
            onClick={handleToggleFavorite}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-secondary-foreground" : ""}`} 
            />
          </Button>
        </div>
        
        <div className="mt-4 relative">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={supplier.images[activeImageIndex]}
              alt={`${supplier.name} - Imagem ${activeImageIndex + 1}`}
              className="h-full w-full object-cover transition-all"
            />
            
            {supplier.images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : supplier.images.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 rounded-full h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setActiveImageIndex(prev => (prev < supplier.images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/40 hover:bg-background/60 rounded-full h-8 w-8"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {supplier.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-auto pb-2">
              {supplier.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`relative h-16 w-16 overflow-hidden rounded-md ${
                    index === activeImageIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveImageIndex(index)}
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
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
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
                href={supplier.website} 
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="conditions">Condições</TabsTrigger>
            <TabsTrigger value="reviews">
              {reviews.length > 0 ? `(${reviews.length}) Avaliações` : 'Avaliações'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 py-4">
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground">
                {supplier.description}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {supplier.categories.map(categoryId => {
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
                      className={categoryColors[categoryName] || 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}
                    >
                      {categoryName}
                    </Badge>
                  );
                })}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Desde</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(supplier.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="conditions" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pedido Mínimo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-semibold">{supplier.min_order}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{formatPaymentMethods(supplier.payment_methods)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Exige CNPJ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{supplier.requires_cnpj ? 'Sim' : 'Não'}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Envio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{formatShippingMethods(supplier.shipping_methods)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4 py-4">
            <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-1/3 space-y-3 bg-muted p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center justify-center my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(averageRating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    {loading ? 'Carregando...' : (loadingReviews ? 'Carregando avaliações...' : `${reviews.length} avaliações`)}
                  </div>
                  
                  <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mb-4" disabled={!isAuthenticated || !supplier}>
                        {isAuthenticated ? (supplier ? `Avalie ${supplier.name}`: 'Carregando...') : 'Faça login para avaliar'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Avalie {supplier.name}</DialogTitle>
                        <DialogDescription>
                          Compartilhe sua experiência com este fornecedor
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sua avaliação</FormLabel>
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
                                      >
                                        <Star
                                          className={`h-6 w-6 ${
                                            star <= selectedRating
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-muted-foreground'
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
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setIsReviewDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit">Enviar avaliação</Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {reviews.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Distribuição das avaliações</h4>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="flex items-center w-10">
                          <span className="text-xs">{rating}</span>
                          <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="h-2 flex-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400" 
                            style={{width: `${ratingPercentages[rating - 1]}%`}}
                          ></div>
                        </div>
                        <span className="text-xs w-8 text-right">
                          {ratingPercentages[rating - 1]}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                {loadingReviews && <div className="text-center py-8"><p>Carregando avaliações...</p></div>}
                {!loadingReviews && reviews.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">
                      Ainda não há avaliações para este fornecedor.
                    </p>
                    <Button onClick={() => setIsReviewDialogOpen(true)} disabled={!isAuthenticated || !supplier}>
                      {isAuthenticated ? (supplier ? 'Seja o primeiro a avaliar' : 'Carregando...') : 'Faça login para avaliar'}
                    </Button>
                  </div>
                )}
                {reviews.length > 0 && (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{review.user_name}</div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Fornecedores similares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MOCK_SUPPLIERS.filter(s => 
              s.id !== supplier.id && 
              s.categories.some(c => supplier.categories.includes(c))
            ).slice(0, 2).map(similar => (
              <Card key={similar.id} className="overflow-hidden card-hover">
                <div className="flex h-32">
                  <div className="w-1/3 bg-muted">
                    <img 
                      src={similar.images[0]} 
                      alt={similar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-3">
                    <h3 className="font-medium text-sm">{similar.name}</h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {similar.city}, {similar.state}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {similar.categories.map(category => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => navigate(`/suppliers/${similar.id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            )) */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
