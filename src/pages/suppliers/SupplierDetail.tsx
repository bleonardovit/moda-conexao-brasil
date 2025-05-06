
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Supplier } from '@/types/supplier';

export default function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real application, fetch data from an API
    // For now, we'll simulate loading and then set mock data
    const timer = setTimeout(() => {
      if (id === "1") {
        setSupplier({
          id: "1",
          code: "SUP001",
          name: "Moda Sustentável Ltda",
          description: "Fornecedor especializado em roupas e acessórios produzidos com materiais sustentáveis e processos éticos.",
          images: ["/placeholder.svg", "/placeholder.svg"],
          instagram: "@modasustentavel",
          whatsapp: "+5511999999999",
          website: "https://example.com",
          min_order: "R$ 500,00",
          payment_methods: ["Boleto", "Pix", "Cartão de Crédito"],
          requires_cnpj: true,
          avg_price: "R$ 150,00",
          city: "São Paulo",
          state: "SP",
          categories: ["Roupas", "Acessórios"],
          delivery_time: "7-15 dias úteis",
          shipping_cost: "Frete fixo para todo Brasil",
          custom_shipping_method: "",
          featured: true,
          hidden: false,
          created_at: "2023-06-15T10:30:00Z",
          updated_at: "2023-08-05T14:45:00Z"
        });
      } else if (id === "2") {
        setSupplier({
          id: "2",
          code: "SUP002",
          name: "Joias Artesanais",
          description: "Produção artesanal de joias com materiais de alta qualidade e design exclusivo.",
          images: ["/placeholder.svg", "/placeholder.svg"],
          instagram: "@joiasartesanais",
          whatsapp: "+5511988888888",
          website: "https://example.com",
          min_order: "R$ 300,00",
          payment_methods: ["Pix", "Transferência Bancária"],
          requires_cnpj: false,
          avg_price: "R$ 200,00",
          city: "Rio de Janeiro",
          state: "RJ",
          categories: ["Joias", "Acessórios"],
          delivery_time: "15-20 dias úteis",
          shipping_cost: "Calcular no fechamento",
          custom_shipping_method: "",
          featured: false,
          hidden: false,
          created_at: "2023-04-22T09:15:00Z",
          updated_at: "2023-07-12T16:20:00Z"
        });
      } else {
        setSupplier({
          id: "3",
          code: "SUP003",
          name: "EcoHome Decorações",
          description: "Itens de decoração produzidos com materiais reciclados e de baixo impacto ambiental.",
          images: ["/placeholder.svg", "/placeholder.svg"],
          instagram: "@ecohome",
          whatsapp: "+5511977777777",
          website: "https://example.com",
          min_order: "R$ 400,00",
          payment_methods: ["Boleto", "Pix"],
          requires_cnpj: true,
          avg_price: "R$ 250,00",
          city: "Curitiba",
          state: "PR",
          categories: ["Decoração", "Casa"],
          delivery_time: "10-15 dias úteis",
          shipping_cost: "Grátis acima de R$ 1.000,00",
          custom_shipping_method: "",
          featured: true,
          hidden: false,
          created_at: "2023-03-10T11:45:00Z",
          updated_at: "2023-09-01T13:30:00Z"
        });
      }
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !supplier) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Fornecedor não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Não foi possível encontrar o fornecedor solicitado."}
          </p>
          <Button asChild>
            <Link to="/fornecedores">Voltar para lista de fornecedores</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">Código: {supplier.code}</p>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <Button variant="outline" asChild>
              <a href={`https://instagram.com/${supplier.instagram}`} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`https://wa.me/${supplier.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
            {supplier.website && (
              <Button variant="outline" asChild>
                <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <img 
                    src={supplier.images[0] || "/placeholder.svg"} 
                    alt={supplier.name} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {supplier.images.length > 1 && (
                    <img 
                      src={supplier.images[1]} 
                      alt={supplier.name} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                  <p>{supplier.description}</p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Pedido Mínimo</h3>
                    <p>{supplier.min_order}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Preço Médio</h3>
                    <p>{supplier.avg_price}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Exige CNPJ</h3>
                    <p>{supplier.requires_cnpj ? "Sim" : "Não"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Tempo de Entrega</h3>
                    <p>{supplier.delivery_time}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Localização</h3>
                    <p>{supplier.city}, {supplier.state}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Formas de Pagamento</h3>
                    <p>{supplier.payment_methods.join(", ")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Categorias</h2>
                <div className="flex flex-wrap gap-2">
                  {supplier.categories.map((category) => (
                    <span 
                      key={category}
                      className="px-3 py-1 bg-muted text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <h2 className="text-xl font-semibold mb-4">Informações de Envio</h2>
                <p className="mb-2">{supplier.shipping_cost}</p>
                {supplier.custom_shipping_method && (
                  <p className="text-sm text-muted-foreground">{supplier.custom_shipping_method}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="policies">Políticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p>Os produtos deste fornecedor estarão disponíveis em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p>As avaliações deste fornecedor estarão disponíveis em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="policies" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p>As políticas de devolução, troca e outras informações relevantes estarão disponíveis em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
