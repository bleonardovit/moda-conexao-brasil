
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Supplier } from '@/types/supplier';
import { getSupplierById, fetchCategories } from '@/services/supplierService';
import { Category } from '@/types/supplier';
import { AlertTriangle } from 'lucide-react';

export default function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('ID do fornecedor não especificado');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching supplier with ID:', id);
        const [supplierData, categoriesData] = await Promise.all([
          getSupplierById(id),
          fetchCategories()
        ]);

        if (!supplierData) {
          setError('Fornecedor não encontrado');
          console.error('Supplier not found for ID:', id);
        } else {
          console.log('Supplier data loaded:', supplierData);
          setSupplier(supplierData);
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Error loading supplier data:', err);
        setError('Erro ao carregar dados do fornecedor. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

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
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Fornecedor não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Não foi possível encontrar o fornecedor solicitado."}
          </p>
          <Button asChild>
            <Link to="/suppliers">Voltar para lista de fornecedores</Link>
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
            {supplier.instagram && (
              <Button variant="outline" asChild>
                <a href={`https://instagram.com/${supplier.instagram}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </Button>
            )}
            {supplier.whatsapp && (
              <Button variant="outline" asChild>
                <a href={`https://wa.me/${supplier.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
            )}
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
                  {supplier.images && supplier.images.length > 0 ? (
                    <img 
                      src={supplier.images[0]} 
                      alt={supplier.name} 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Sem imagem</p>
                    </div>
                  )}
                  {supplier.images && supplier.images.length > 1 && (
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
                    <p>{supplier.min_order || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Preço Médio</h3>
                    <p>{supplier.avg_price || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Exige CNPJ</h3>
                    <p>{supplier.requires_cnpj ? "Sim" : "Não"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Tempo de Entrega</h3>
                    <p>{supplier.delivery_time || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Localização</h3>
                    <p>{supplier.city}, {supplier.state}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Formas de Pagamento</h3>
                    <p>{supplier.payment_methods?.join(", ") || "Não informado"}</p>
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
                  {supplier.categories && supplier.categories.length > 0 ? (
                    supplier.categories.map((categoryId) => (
                      <span 
                        key={categoryId}
                        className="px-3 py-1 bg-muted text-sm rounded-full"
                      >
                        {getCategoryName(categoryId)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Sem categorias</span>
                  )}
                </div>
                
                <Separator className="my-6" />
                
                <h2 className="text-xl font-semibold mb-4">Informações de Envio</h2>
                {supplier.shipping_methods && supplier.shipping_methods.length > 0 ? (
                  <p className="mb-2">{supplier.shipping_methods.join(', ')}</p>
                ) : (
                  <p className="mb-2 text-muted-foreground">Não informado</p>
                )}
                {supplier.custom_shipping_method && (
                  <p className="text-sm text-muted-foreground">{supplier.custom_shipping_method}</p>
                )}
                {supplier.shipping_cost && (
                  <div className="mt-2">
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Custo de Envio</h3>
                    <p>{supplier.shipping_cost}</p>
                  </div>
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
