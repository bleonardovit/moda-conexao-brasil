import { useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

// Dados de exemplo
const MOCK_USER: User = {
  id: 'user123',
  email: 'maria@example.com',
  full_name: 'Maria Oliveira',
  phone: '(11) 98765-4321',
  subscription_status: 'active',
  subscription_type: 'monthly',
  subscription_start_date: '2023-06-15',
  last_login: '2023-08-01T10:30:00Z',
  role: 'user'
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar os dados do usuário
    // ... existing code ...
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Não foi possível sair da conta. Tente novamente."
      });
    }
  };
  
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(99) 99999-9999"
                      />
                    </div>
                  </>
                ) : (
                  // Modo de visualização
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                        <p>{user?.full_name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{user?.email}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                        <p>{user?.phone || 'Não informado'}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Último acesso</h3>
                        <p>{user?.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isEditing ? (
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                      Salvar alterações
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
