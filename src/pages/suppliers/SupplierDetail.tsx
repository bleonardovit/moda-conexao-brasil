import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { getSupplierById } from '@/services/supplierService';
import { useTrialStatus } from '@/hooks/use-trial-status';
import { LockedSupplierDetail } from '@/components/trial/LockedSupplierDetail';
import { useAuth } from '@/hooks/useAuth';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { isInTrial, isSupplierAllowed } = useTrialStatus();
  const [isAccessible, setIsAccessible] = useState(true);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // First check if trial user has access to this supplier
        if (isInTrial && user?.id) {
          const hasAccess = await isSupplierAllowed(id);
          setIsAccessible(hasAccess);
          
          // If no access, we still load the supplier but will show locked UI
          if (!hasAccess) {
            const supplierData = await getSupplierById(id, user.id);
            setSupplier(supplierData);
            setIsLoading(false);
            return;
          }
        }
        
        const supplierData = await getSupplierById(id, user?.id);
        setSupplier(supplierData);
      } catch (error) {
        console.error('Error fetching supplier details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSupplier();
  }, [id, user?.id, isInTrial, isSupplierAllowed]);

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
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Fornecedor não encontrado.</p>
          <Button asChild>
            <Link to="/suppliers">Voltar para a lista</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  // Show locked content for trial users without access to this supplier
  if (isInTrial && !isAccessible) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-6">
          <LockedSupplierDetail />
        </div>
      </AppLayout>
    );
  }

  // Content for users with access
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">{supplier.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sobre o Fornecedor</h2>
                <p className="text-gray-600 dark:text-gray-300">{supplier.description}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Localização:</span> {supplier.city}, {supplier.state}
                  </div>
                  {supplier.instagram && (
                    <div>
                      <span className="font-medium">Instagram:</span> {supplier.instagram}
                    </div>
                  )}
                  {supplier.whatsapp && (
                    <div>
                      <span className="font-medium">WhatsApp:</span> {supplier.whatsapp}
                    </div>
                  )}
                  {supplier.website && (
                    <div>
                      <span className="font-medium">Website:</span> {supplier.website}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Condições de Compra</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Pedido mínimo:</span> {supplier.min_order || "Não informado"}
                  </div>
                  <div>
                    <span className="font-medium">Exige CNPJ:</span> {supplier.requires_cnpj ? "Sim" : "Não"}
                  </div>
                  <div>
                    <span className="font-medium">Formas de pagamento:</span> {supplier.payment_methods.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Formas de envio:</span> {supplier.shipping_methods.join(", ")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Galeria</h2>
                <div className="grid grid-cols-2 gap-2">
                  {supplier.images && supplier.images.length > 0 ? (
                    supplier.images.map((image, index) => (
                      <img 
                        key={index} 
                        src={image} 
                        alt={`${supplier.name} - Imagem ${index + 1}`} 
                        className="rounded-md object-cover w-full h-32"
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2 text-center py-8">Sem imagens disponíveis</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ações</h2>
                <div className="space-y-3">
                  {supplier.website && (
                    <Button className="w-full" asChild>
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                        Visitar Website
                      </a>
                    </Button>
                  )}
                  {supplier.instagram && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        Ver Instagram
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/suppliers">
                      Voltar para a lista
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
