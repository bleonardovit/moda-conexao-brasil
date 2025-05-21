import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  rating: z.number().min(1, { message: "Avaliação mínima é 1 estrela."}).max(5, { message: "Avaliação máxima é 5 estrelas."}),
  comment: z.string().min(5, {
    message: "A avaliação precisa ter pelo menos 5 caracteres.",
  }).max(500, { message: "O comentário não pode exceder 500 caracteres."}),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function SupplierDetail() {
  const { id: supplierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();
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
    if (!supplierId) {
      setError('ID do fornecedor não fornecido.');
      setLoading(false);
      setReviews([]);
      return;
    }

    const fetchSupplierDetailsAndReviews = async () => {
      setLoading(true);
      setError(null);
      setReviews([]);
      try {
        const fetchedSupplier = await getSupplierById(supplierId, userId); 
        if (fetchedSupplier) {
          setSupplier(fetchedSupplier);
          setLoadingReviews(true);
          try {
            const fetchedReviews = await getReviewsBySupplierId(supplierId);
            setReviews(fetchedReviews);
          } catch (reviewError) {
            console.error("Erro ao buscar reviews:", reviewError);
            toast({ title: "Erro ao carregar avaliações", variant: "destructive", description: (reviewError as Error).message });
          } finally {
            setLoadingReviews(false);
          }
        } else {
          setError('Fornecedor não encontrado.');
          setSupplier(null);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do fornecedor:", err);
        setError('Falha ao carregar dados do fornecedor.');
        setSupplier(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierDetailsAndReviews();
  }, [supplierId, userId, toast]);
  
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
    if (!supplier) return;
    const url = window.location.href;
    const shareData = {
        title: `Fornecedor: ${supplier.name}`,
        text: `Confira este fornecedor: ${supplier.name} - ${supplier.description?.substring(0,100)}...`,
        url,
      };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link do fornecedor foi copiado para a área de transferência.",
          duration: 2000,
        });
      } else {
         toast({ title: "Compartilhamento não suportado", description: "Seu navegador não suporta esta funcionalidade.", variant: "destructive"});
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast({ title: "Erro ao compartilhar", description: "Não foi possível compartilhar o link.", variant: "destructive"});
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
      setReviews(prevReviews => [newReviewFromDb, ...prevReviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setIsReviewDialogOpen(false);
      toast({
        title: "Avaliação enviada",
        description: "Obrigado por compartilhar sua opinião!",
        duration: 3000,
      });
      form.reset({ rating: 0, comment: ""});
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
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro ao Carregar</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/suppliers')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Fornecedores
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Fornecedor Não Encontrado</h1>
          <p className="text-muted-foreground">O fornecedor que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/suppliers')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Fornecedores
          </Button>
        </div>
      </AppLayout>
    );
  }

  const formatPaymentMethods = (methods?: string[]) => {
    if (!methods || methods.length === 0) return 'Não informado';
    const mapping: Record<string, string> = {
      'pix': 'PIX',
      'card': 'Cartão',
      'bankslip': 'Boleto'
    };
    return methods.map(m => mapping[m] || m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
  };
  
  const formatShippingMethods = (methods?: string[]) => {
    if (!methods || methods.length === 0) return 'Não informado';
    const mapping: Record<string, string> = {
      'correios': 'Correios',
      'transporter': 'Transportadora',
      'delivery': 'Entrega local',
      'excursion': 'Excursão',
      'air': 'Aéreo',
      'custom': 'Personalizado'
    };
    return methods.map(m => mapping[m] || m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
  };
  
  const isNew = () => {
    if (!supplier.created_at) return false;
    const createdDate = new Date(supplier.created_at);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return createdDate > oneMonthAgo;
  };

  const mainImage = supplier.images && supplier.images.length > 0 ? supplier.images[activeImageIndex] : 'https://via.placeholder.com/800x600?text=Sem+Imagem';


  return (
    <AppLayout>
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              aria-label="Voltar para a página anterior"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousSupplier}
                disabled // Feature not implemented
                className="h-8 w-8"
                aria-label="Fornecedor Anterior"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextSupplier}
                disabled // Feature not implemented
                className="h-8 w-8"
                aria-label="Próximo Fornecedor"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="md:flex md:items-start md:justify-between mb-4">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold mb-1">{supplier.name}</h1>
              <div className="flex items-center text-sm text-muted-foreground gap-2 mb-1">
                <MapPin className="h-4 w-4" />
                <span>{supplier.city}, {supplier.state}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Código: {supplier.code || 'N/D'}
              </p>
              
              {isNew() && (
                <Badge className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-0.5">NOVO</Badge>
              )}
               {supplier.featured && (
                <Badge variant="secondary" className="mt-2 ml-2 text-xs border-amber-500 text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/50">
                  <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" />
                  DESTAQUE
                </Badge>
              )}
            </div>
            <Button 
              variant={isFavorite(supplier.id) ? "default" : "outline"} 
              size="icon"
              onClick={handleToggleFavorite}
              className={`shrink-0 ${isFavorite(supplier.id) ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              aria-label={isFavorite(supplier.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite(supplier.id) ? "fill-white" : ""}`} 
              />
            </Button>
          </div>
          
          <div className="mt-4 relative group">
            <div className="relative aspect-video sm:aspect-[16/10] md:aspect-[2/1] lg:max-h-[500px] overflow-hidden rounded-lg bg-muted border">
              <img
                src={mainImage}
                alt={`${supplier.name} - Imagem ${activeImageIndex + 1}`}
                className="h-full w-full object-contain transition-opacity duration-300"
              />
              
              {supplier.images && supplier.images.length > 1 && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : supplier.images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Imagem Anterior"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setActiveImageIndex(prev => (prev < supplier.images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Próxima Imagem"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            
            {supplier.images && supplier.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
                {supplier.images.map((image, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-md shrink-0 border-2 ${
                      index === activeImageIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground/50'
                    } transition-all`}
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
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs pointer-events-none">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-gray-300">({reviews.length})</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {supplier.instagram && (
              <Button variant="outline" asChild size="sm">
                <a 
                  href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </a>
              </Button>
            )}
            
            {supplier.whatsapp && (
              <Button variant="outline" asChild size="sm">
                <a 
                  href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, vi o contato de ${supplier.name} no Guia de Fornecedores e gostaria de mais informações.`)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            
            {supplier.website && (
              <Button variant="outline" asChild size="sm">
                <a 
                  href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            
            <Button variant="outline" onClick={handleShare} size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>
          
          <Tabs defaultValue="info" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="conditions">Condições</TabsTrigger>
              <TabsTrigger value="reviews">
                {loadingReviews ? 'Avaliações' : reviews.length > 0 ? `Avaliações (${reviews.length})` : 'Avaliações'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6 py-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {supplier.description || 'Nenhuma descrição fornecida.'}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Categorias</h3>
                {supplier.categories && supplier.categories.length > 0 ? (
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
                          className={`font-normal text-xs px-2.5 py-1 ${categoryColors[categoryName] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                        >
                          {categoryName}
                        </Badge>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma categoria informada.</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Na plataforma desde</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {supplier.created_at 
                      ? new Date(supplier.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Data não informada'
                    }
                  </span>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Pedido Mínimo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{supplier.min_order || 'Não informado'}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formatPaymentMethods(supplier.payment_methods)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Exige CNPJ?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{supplier.requires_cnpj ? 'Sim' : 'Não'}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Envio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{formatShippingMethods(supplier.shipping_methods)}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="py-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-full md:w-1/3 space-y-4 bg-muted/50 p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-300 dark:text-gray-500'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {loadingReviews ? 'Calculando...' : `${reviews.length} ${reviews.length === 1 ? 'avaliação' : 'avaliações'}`}
                    </div>
                    
                    <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mb-2" disabled={!isAuthenticated || !supplier}>
                          {isAuthenticated ? (supplier ? `Avaliar ${supplier.name}`: 'Carregando...') : 'Faça login para avaliar'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Avalie {supplier?.name || 'este fornecedor'}</DialogTitle>
                          <DialogDescription>
                            Sua opinião é importante para outros usuários.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-6">
                            <FormField
                              control={form.control}
                              name="rating"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sua nota <span className="text-destructive">*</span></FormLabel>
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
                                          className="h-9 w-9 p-0"
                                          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
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
                                  <FormLabel>Seu comentário <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Descreva sua experiência (mín. 5 caracteres)"
                                      {...field}
                                      rows={4}
                                      className="resize-none"
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
                              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
                                {form.formState.isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {reviews.length > 0 && !loadingReviews && (
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-center mb-2">Distribuição</h4>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2 text-xs">
                          <div className="flex items-center w-10">
                            <span>{rating}</span>
                            <Star className="h-3 w-3 ml-0.5 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="h-2 flex-1 bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-300" 
                              style={{width: `${ratingPercentages[rating - 1]}%`}}
                              aria-label={`${ratingPercentages[rating - 1]}% das avaliações são ${rating} estrelas`}
                            ></div>
                          </div>
                          <span className="w-8 text-right tabular-nums">
                            {ratingPercentages[rating - 1]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {loadingReviews && <div className="text-center py-8"><p className="text-muted-foreground">Carregando avaliações...</p></div>}
                  {!loadingReviews && reviews.length === 0 && (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border">
                      <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-3 text-sm">
                        Ainda não há avaliações para este fornecedor.
                      </p>
                      <Button onClick={() => setIsReviewDialogOpen(true)} disabled={!isAuthenticated || !supplier} size="sm">
                        {isAuthenticated ? (supplier ? 'Seja o primeiro a avaliar' : 'Carregando...') : 'Faça login para avaliar'}
                      </Button>
                    </div>
                  )}
                  {reviews.length > 0 && (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="pb-6 border-b last:border-b-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="font-semibold text-sm">{review.user_name || 'Usuário Anônimo'}</div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-gray-300 dark:text-gray-500'
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{review.comment}</p>
                          <div className="text-xs text-muted-foreground/80 mt-2">
                            {new Date(review.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Fornecedores Similares</h2>
             <div className="text-sm text-muted-foreground p-6 bg-muted/30 rounded-lg border text-center">
              (Funcionalidade de fornecedores similares em desenvolvimento)
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
