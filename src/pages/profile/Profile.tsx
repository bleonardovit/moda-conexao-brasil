
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
import { toast } from 'sonner';
import type { User } from '@/types';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { SubscriptionManager } from '@/components/profile/SubscriptionManager';

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
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar os dados do usuário
    setUser(prev => ({
      ...prev,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone
    }));
    setIsEditing(false);
    toast.success("Informações atualizadas com sucesso");
  };

  const handleLogout = () => {
    // Aqui seria implementada a lógica para logout
    toast.info("Sessão encerrada");
    // Redirecionar para página de login
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        
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
        
        {/* Cartão de assinatura - Agora é um componente separado */}
        <SubscriptionManager user={user} />
        
        {/* Opções de conta */}
        <Card>
          <CardHeader>
            <CardTitle>Opções da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              Alterar senha
            </Button>
            
            {showPasswordForm && (
              <div className="mt-4 p-4 border rounded-md">
                <ChangePasswordForm onComplete={() => setShowPasswordForm(false)} />
              </div>
            )}
            
            <Separator />
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              Sair da conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
