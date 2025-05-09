
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/layout/AppLayout';
import { toast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { SubscriptionManager } from '@/components/profile/SubscriptionManager';
import type { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  
  // Efeito para carregar os dados do usuário quando o componente montar
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    } else {
      // Redirecionar para login se não estiver autenticado
      navigate('/auth/login');
    }
  }, [user, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Atualizar os dados do usuário no contexto
      // (Observe que não estamos atualizando o email aqui,
      // pois isso geralmente requer um fluxo separado com verificação)
      
      toast({
        title: "Sucesso!",
        description: "Suas informações foram atualizadas."
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar suas informações. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    // O redirecionamento é tratado no hook useAuth
  };
  
  if (!user) {
    return null; // Ou algum componente de carregamento
  }
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda - Informações do usuário */}
          <div className="md:col-span-2 space-y-6">
            {/* Cartão de informações do usuário */}
            <Card>
              <CardHeader>
                <CardTitle>Suas Informações</CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  // Modo de edição
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email não pode ser alterado aqui
                      />
                      <p className="text-sm text-muted-foreground">
                        O email não pode ser alterado nesta seção.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(99) 99999-9999"
                        disabled={isLoading}
                      />
                    </div>
                  </>
                ) : (
                  // Modo de visualização
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                        <p>{user.full_name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{user.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                        <p>{user.phone || 'Não informado'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Último acesso</h3>
                        <p>{user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isEditing ? (
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Editar informações
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {/* Formulário de troca de senha */}
            <PasswordChangeForm />
          </div>
          
          {/* Coluna da direita - Assinatura e opções de conta */}
          <div className="space-y-6">
            {/* Gerenciador de assinatura */}
            <SubscriptionManager user={user} />
            
            {/* Opções de conta */}
            <Card>
              <CardHeader>
                <CardTitle>Opções da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sair da conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
