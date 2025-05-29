import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Instagram, MessageCircle, Star, Heart, MapPin, CreditCard, Truck, Building, ShoppingCart, Info } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFavorites } from '@/hooks/use-favorites';
import { LockedSupplierDetail } from '@/components/trial/LockedSupplierDetail';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Supplier, Category, Review } from '@/types';
import { getSupplierById } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { getSupplierReviews, getSupplierAverageRating } from '@/services/reviewService';
import { useAuth } from '@/hooks/useAuth';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const { user } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [supplierData, categoriesData, reviewsData, ratingData] = await Promise.all([
          getSupplierById(id, user?.id),
          getCategories(),
          getSupplierReviews(id),
          getSupplierAverageRating(id)
        ]);

        if (supplierData) {
          setSupplier(supplierData);
          setCategories(categoriesData);
          setReviews(reviewsData);
          setAverageRating(ratingData);
        } else {
          toast({
            title: "Fornecedor não encontrado",
            description: "O fornecedor que você está procurando não existe ou foi removido.",
            variant: "destructive",
          });
          navigate('/suppliers');
        }
      } catch (error) {
        console.error('Error fetching supplier details:', error);
        toast({
          title: "Erro ao carregar fornecedor",
          description: "Não foi possível carregar os detalhes do fornecedor.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, toast, navigate, user?.id]);

  const categoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const categoryStyle = (categoryName: string) => {
    const categoryColors: Record<string, string> = {
      'Casual': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Fitness': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Plus Size': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Acessórios': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Praia': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return categoryColors[categoryName] || '';
  };

  const formatAvgPrice = (price: string) => {
    switch (price) {
      case 'low':
        return 'Baixo';
      case 'medium':
        return 'Médio';
      case 'high':
        return 'Alto';
      default:
        return 'Não informado';
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : supplier ? supplier.images.length - 1 : 0));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (supplier && prevIndex < supplier.images.length - 1 ? prevIndex + 1 : 0));
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleGoBack = () => {
    navigate('/suppliers');
  };

  const handleOpenMap = () => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${supplier?.city},${supplier?.state}`;
    window.open(mapUrl, '_blank');
  };

  const handleOpenWebsite = () => {
    if (supplier?.website) {
      window.open(supplier.website, '_blank');
    }
  };

  const handleOpenInstagram = () => {
    if (supplier?.instagram) {
      window.open(`https://www.instagram.com/${supplier.instagram}`, '_blank');
    }
  };

  const handleOpenWhatsApp = () => {
    if (supplier?.whatsapp) {
      window.open(`https://wa.me/${supplier.whatsapp}`, '_blank');
    }
  };

  const handleToggleFavorite = () => {
    if (!supplier) return;
    
    const wasAlreadyFavorite = isFavorite(supplier.id);
    toggleFavorite(supplier.id);
    
    const action = wasAlreadyFavorite ? 'removido dos' : 'adicionado aos';
    toast({
      title: wasAlreadyFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: `${supplier.name} foi ${action} seus favoritos.`,
      duration: 2000,
    });
  };

  const renderStarRating = () => {
    const roundedRating = averageRating ? Math.round(averageRating * 2) / 2 : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (roundedRating >= i) {
        stars.push(<Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />);
      } else if (roundedRating >= i - 0.5) {
        stars.push(<Star key={i} className="h-5 w-5 text-yellow-500 stroke-yellow-500" />);
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando detalhes do fornecedor...</p>
        </div>
      </AppLayout>
    );
  }

  if (!supplier) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-muted-foreground">Fornecedor não encontrado</p>
          <Button onClick={() => navigate('/suppliers')}>
            Voltar para fornecedores
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Check if supplier is locked for trial users
  if (supplier.isLockedForTrial) {
    return (
      <AppLayout>
        <LockedSupplierDetail supplier={supplier} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container relative py-10">
        <Button variant="ghost" onClick={handleGoBack} className="absolute top-2 left-2 md:top-0 md:left-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="md:order-1">
            {supplier.images.length > 0 ? (
              <div className="space-y-4">
                <img
                  src={supplier.images[currentImageIndex]}
                  alt={`${supplier.name} - Imagem ${currentImageIndex + 1}`}
                  className="w-full rounded-lg aspect-video object-cover"
                />
                <div className="relative">
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-2">
                      {supplier.images.map((image, index) => (
                        <div key={index} className="flex-[0_0_20%] min-w-[80px]">
                          <img
                            src={image}
                            alt={`${supplier.name} - Thumbnail ${index + 1}`}
                            className={`w-full h-20 rounded-md object-cover cursor-pointer transition-all ${
                              index === currentImageIndex 
                                ? 'ring-2 ring-primary scale-105' 
                                : 'hover:scale-105'
                            }`}
                            onClick={() => handleImageClick(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {supplier.images.length > 4 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={scrollPrev}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={scrollNext}
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 aspect-video flex items-center justify-center">
                  <Info className="h-10 w-10 text-muted-foreground" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Supplier Details */}
          <div className="md:order-2 space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{supplier.name}</h1>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
              >
                {isFavorite(supplier.id) ? (
                  <>
                    <Heart className="mr-2 h-4 w-4 fill-red-500 text-red-500" />
                    Remover dos Favoritos
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Adicionar aos Favoritos
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {renderStarRating()}
              {averageRating !== null && (
                <span className="text-sm text-muted-foreground">
                  ({averageRating.toFixed(1)})
                </span>
              )}
            </div>

            <p className="text-muted-foreground">{supplier.description}</p>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Informações</h2>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{supplier.city}, {supplier.state}</span>
                <Button variant="link" onClick={handleOpenMap} className="p-0">
                  Ver no mapa
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Button>
              </div>
              {supplier.min_order && (
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span>Pedido mínimo: {supplier.min_order}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>
                  Formas de pagamento: {supplier.payment_methods.map((method, index) => (
                  <span key={index}>
                    {method}
                    {index < supplier.payment_methods.length - 1 ? ', ' : ''}
                  </span>
                ))}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>
                  Formas de envio: {supplier.shipping_methods.map((method, index) => (
                  <span key={index}>
                    {method}
                    {index < supplier.shipping_methods.length - 1 ? ', ' : ''}
                  </span>
                ))}
                  {supplier.custom_shipping_method && `, ${supplier.custom_shipping_method}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Preço médio: {formatAvgPrice(supplier.avg_price)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Contato</h2>
              {supplier.website && (
                <div className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <Button variant="link" onClick={handleOpenWebsite} className="p-0">
                    Website
                  </Button>
                </div>
              )}
              {supplier.instagram && (
                <div className="flex items-center space-x-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <Button variant="link" onClick={handleOpenInstagram} className="p-0">
                    @{supplier.instagram}
                  </Button>
                </div>
              )}
              {supplier.whatsapp && (
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <Button variant="link" onClick={handleOpenWhatsApp} className="p-0">
                    WhatsApp
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {supplier.categories.map(categoryId => {
                  const name = categoryName(categoryId);
                  return (
                    <Badge key={categoryId} className={categoryStyle(name)}>
                      {name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
