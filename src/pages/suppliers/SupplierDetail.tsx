
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Instagram, 
  ArrowLeft, 
  Globe, 
  MessageCircle, 
  Share2, 
  Star,
  Heart,
  Mail
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
import type { Supplier, Review } from '@/types';

// Dados de exemplo
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    code: 'SP001',
    name: 'Moda Fashion SP',
    description: 'Atacado de roupas femininas com foco em tendências atuais. Trabalhamos com moda casual, festa e fitness para lojistas e revendedores. Atuando no mercado há mais de 10 anos, somos referência em qualidade e bom preço.',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    instagram: '@modafashionsp',
    whatsapp: '+5511999999999',
    min_order: 'R$ 300,00',
    payment_methods: ['pix', 'card', 'bankslip'],
    requires_cnpj: true,
    avg_price: 'medium',
    shipping_methods: ['correios', 'transporter'],
    city: 'São Paulo',
    state: 'SP',
    categories: ['Casual', 'Fitness'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2',
    code: 'CE001',
    name: 'Brindes Fortaleza',
    description: 'Acessórios e bijuterias para revenda',
    images: ['/placeholder.svg'],
    instagram: '@brindesfortaleza',
    whatsapp: '+5585999999999',
    min_order: 'R$ 200,00',
    payment_methods: ['pix', 'bankslip'],
    requires_cnpj: false,
    avg_price: 'low',
    shipping_methods: ['correios'],
    city: 'Fortaleza',
    state: 'CE',
    categories: ['Acessórios'],
    featured: false,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

// Avaliações de exemplo
const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    supplier_id: '1',
    user_id: 'user1',
    user_name: 'Maria Silva',
    rating: 5,
    comment: 'Ótimos produtos, chegaram rápido e com boa qualidade. Preço justo!',
    created_at: '2023-05-15'
  },
  {
    id: '2',
    supplier_id: '1',
    user_id: 'user2',
    user_name: 'Ana Oliveira',
    rating: 4,
    comment: 'Bom atendimento, mas o frete foi um pouco caro.',
    created_at: '2023-04-20'
  }
];

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Encontrar fornecedor pelo ID
  const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
  
  // Obter avaliações para este fornecedor
  const reviews = MOCK_REVIEWS.filter(r => r.supplier_id === id);
  
  // Calcular avaliação média
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  if (!supplier) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-xl font-bold mb-4">Fornecedor não encontrado</h1>
          <Button onClick={() => navigate('/suppliers')}>
            Voltar para lista
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Formatar métodos de pagamento
  const formatPaymentMethods = (methods: string[]) => {
    const mapping: Record<string, string> = {
      'pix': 'PIX',
      'card': 'Cartão',
      'bankslip': 'Boleto'
    };
    return methods.map(m => mapping[m] || m).join(', ');
  };
  
  // Formatar métodos de envio
  const formatShippingMethods = (methods: string[]) => {
    const mapping: Record<string, string> = {
      'correios': 'Correios',
      'transporter': 'Transportadora',
      'delivery': 'Entrega local'
    };
    return methods.map(m => mapping[m] || m).join(', ');
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/suppliers')}
          className="mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">{supplier.city}, {supplier.state}</p>
          </div>
          <Button 
            variant={isFavorite ? "secondary" : "outline"} 
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? "fill-secondary-foreground" : ""}`} 
            />
          </Button>
        </div>
        
        {/* Galeria de imagens */}
        <div className="mt-4">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={supplier.images[activeImageIndex]}
              alt={`${supplier.name} - Imagem ${activeImageIndex + 1}`}
              className="h-full w-full object-cover transition-all"
            />
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
        </div>
        
        {/* Ações rápidas */}
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
          
          <Button variant="outline" onClick={() => {
            /* Implementar compartilhamento */
            alert('Compartilhar: ' + window.location.href);
          }}>
            <Share2 className="mr-2 h-5 w-5" />
            Compartilhar
          </Button>
        </div>
        
        {/* Abas de informações */}
        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="conditions">Condições</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>
          
          {/* Aba de informações gerais */}
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
                {supplier.categories.map(category => (
                  <Badge key={category} variant="outline">{category}</Badge>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Aba de condições de compra */}
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
          
          {/* Aba de avaliações */}
          <TabsContent value="reviews" className="space-y-4 py-4">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {reviews.length} avaliações
                </div>
              </div>
              
              <div className="flex-1">
                <Button variant="outline" className="w-full">
                  Adicionar avaliação
                </Button>
              </div>
            </div>
            
            {reviews.length > 0 ? (
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
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">
                  Ainda não há avaliações para este fornecedor.
                </p>
                <Button>Seja o primeiro a avaliar</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Fornecedores similares */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Fornecedores similares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SUPPLIERS.filter(s => s.id !== supplier.id).map(similar => (
              <Card key={similar.id} className="overflow-hidden">
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
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
