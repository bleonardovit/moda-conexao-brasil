
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// SECURITY: Helper function to validate user profile exists and is active
const validateUserProfile = async (userId: string): Promise<{ isValid: boolean; profile?: any; reason?: string }> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`SECURITY ALERT: Orphaned auth user detected: ${userId}`);
        return { isValid: false, reason: 'ORPHANED_USER' };
      }
      console.error('Error validating user profile:', error);
      return { isValid: false, reason: 'PROFILE_ERROR' };
    }
    
    if (!profile) {
      console.warn(`SECURITY ALERT: No profile found for user: ${userId}`);
      return { isValid: false, reason: 'NO_PROFILE' };
    }
    
    // Check if user is deactivated/banned
    if (profile.subscription_status === 'inactive' && profile.role !== 'admin') {
      console.warn(`SECURITY ALERT: Deactivated user attempted password change: ${userId}`);
      return { isValid: false, reason: 'DEACTIVATED_USER' };
    }
    
    return { isValid: true, profile };
  } catch (error) {
    console.error('Error in validateUserProfile:', error);
    return { isValid: false, reason: 'VALIDATION_ERROR' };
  }
};

export function PasswordChangeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive'
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // SECURITY: Get current user and validate profile before allowing password change
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      // SECURITY: Validate user profile exists and is active
      const validation = await validateUserProfile(user.id);
      
      if (!validation.isValid) {
        console.error(`SECURITY: Password change blocked for ${user.email} - Reason: ${validation.reason}`);
        
        // Handle different validation failure reasons
        if (validation.reason === 'ORPHANED_USER') {
          toast({
            title: 'Erro de segurança',
            description: 'Esta conta não existe mais no sistema. Entre em contato com o suporte.',
            variant: 'destructive'
          });
        } else if (validation.reason === 'DEACTIVATED_USER') {
          toast({
            title: 'Conta desativada',
            description: 'Sua conta foi desativada. Entre em contato com o suporte.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Erro de validação',
            description: 'Não foi possível validar sua conta. Entre em contato com o suporte.',
            variant: 'destructive'
          });
        }
        
        // Force sign out for security
        await supabase.auth.signOut();
        return;
      }
      
      // Update password with Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Sua senha foi alterada com sucesso.',
      });
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar sua senha. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>
          Atualize sua senha para manter sua conta segura
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando senha...
              </>
            ) : 'Alterar senha'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
