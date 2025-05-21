import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Instagram, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSupplierById } from '@/services/supplierService';
import { getCategories } from '@/services/categoryService';
import { useAuth } from '@/hooks/useAuth';
import { useTrialStatus } from '@/hooks/use-trial-status'; // Add this import
import { LockedSupplierDetail } from '@/components/trial/LockedSupplierDetail'; // Add this import
import { TrialBanner } from '@/components/trial/TrialBanner'; // Add this import
import type { Supplier, Category } from '@/types';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Add trial status
  const { isInTrial, isSupplierAllowed } = useTrialStatus();
  const [hasAccess, setHasAccess] = useState(true);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  };

  // Modified to include trial access check
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // First check if this supplier is allowed in trial
        if (isInTrial) {
          const access = await isSupplierAllowed(id);
          setHasAccess(access);
          
          if (!access) {
            setIsLoading(false);
            return; // Don't fetch supplier data if no access
          }
        }
        
        const [supplierData, categoriesData] = await Promise.all([
          getSupplierById(id, user?.id),
          getCategories()
        ]);
        
        setSupplier(supplierData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching supplier details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, user?.id, isInTrial, isSupplierAllowed]);

  // Format payment methods for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'card':
        return 'Cartão';
      case 'bankslip':
        return 'Boleto';
      default:
        return method;
    }
  };

  // Format shipping methods for display
  const formatShippingMethod = (method: string) => {
    switch (method) {
      case 'correios':
        return 'Correios';
      case 'delivery':
        return 'Entrega própria';
      case 'transporter':
        return 'Transportadora';
      case 'excursion':
        return 'Excursão';
      case 'air':
        return 'Aéreo';
      case 'custom':
        return supplier?.custom_shipping_method || 'Método personalizado';
      default:
        return method;
    }
  };

  if (isLoading) {
    return <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando detalhes do fornecedor...</p>
        </div>
      </AppLayout>;
  }
  
  // Show locked content if trial user doesn't have access to this supplier
  if (isInTrial && !hasAccess) {
    return <AppLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/suppliers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para fornecedores
          </Link>
        </Button>
      </div>
      
      <TrialBanner />
      
      <div className="mt-6">
        <LockedSupplierDetail />
      </div>
    </AppLayout>;
  }

  if (!supplier) {
    return <AppLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Fornecedor não encontrado ou você não tem acesso a ele.</p>
          <Button asChild>
            <Link to="/suppliers">Voltar para a lista de fornecedores</Link>
          </Button>
        </div>
      </AppLayout>;
  }

  return (
    <AppLayout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/suppliers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para fornecedores
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="sm:flex">
            <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
              <img
                src={supplier.images && supplier.images.length > 0 ? supplier.images[0] : '/placeholder.svg'}
                alt={supplier.name}
                className="w-full h-full object-fill"
              />
            </div>
            <CardContent className="sm:w-2/3 md:w-3/4 p-4">
              <h1 className="text-2xl font-bold mb-2">{supplier.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{supplier.city}, {supplier.state}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {supplier.categories && supplier.categories.length > 0 ? (
                  supplier.categories.map(categoryId => {
                    const categoryName = getCategoryName(categoryId);
                    return categoryName ? (
                      <Badge key={categoryId} variant="outline">
                        {categoryName}
                      </Badge>
                    ) : null;
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">Sem categorias</span>
                )}
              </div>
              <p className="text-sm mb-4">{supplier.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || "Não informado"}
                </div>
                <div>
                  <span className="font-medium">Preço médio:</span> {supplier.avg_price || "Não informado"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {supplier.instagram && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                      <Instagram className="mr-1 h-4 w-4" />
                      Instagram
                    </a>
                  </Button>
                )}
                {supplier.website && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-1 h-4 w-4" />
                      Site
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </div>
        </Card>

        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="shipping">Entrega</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="space-y-2">
            <h3 className="text-lg font-semibold">Métodos de Pagamento</h3>
            <Separator />
            <ul className="list-none pl-0">
              {supplier.payment_methods.length > 0 ? (
                supplier.payment_methods.map((method, index) => (
                  <li key={index} className="py-1">
                    {formatPaymentMethod(method)}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Nenhum método de pagamento informado.</li>
              )}
            </ul>
          </TabsContent>
          <TabsContent value="shipping" className="space-y-2">
            <h3 className="text-lg font-semibold">Métodos de Envio</h3>
            <Separator />
            <ul className="list-none pl-0">
              {supplier.shipping_methods.length > 0 ? (
                supplier.shipping_methods.map((method, index) => (
                  <li key={index} className="py-1">
                    {formatShippingMethod(method)}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Nenhum método de envio informado.</li>
              )}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
