
import React, { useState, useEffect } from 'react';
import { getSecuritySettings, updateSecuritySetting } from '@/services/securityService';
import { SecuritySetting } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSecuritySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar as configurações de segurança.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (id: number, value: string) => {
    if (!user) return;
    
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      const success = await updateSecuritySetting(id, value, user.id);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Configuração atualizada com sucesso.",
        });
        
        // Update local state
        setSettings(prev => 
          prev.map(setting => 
            setting.id === id ? { ...setting, value } : setting
          )
        );
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao atualizar configuração.",
        });
      }
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar configuração.",
      });
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleValueChange = (id: number, value: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <CardTitle>Configurações de Segurança</CardTitle>
        <CardDescription>
          Ajuste os parâmetros de segurança do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <Label htmlFor={`setting-${setting.id}`}>
                  {setting.key === 'max_login_attempts' && 'Número máximo de tentativas de login'}
                  {setting.key === 'block_duration_minutes' && 'Duração do bloqueio (minutos)'}
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id={`setting-${setting.id}`}
                    type="number"
                    min="1"
                    value={setting.value}
                    onChange={(e) => handleValueChange(setting.id, e.target.value)}
                  />
                  <Button 
                    onClick={() => handleUpdateSetting(setting.id, setting.value)}
                    disabled={saving[setting.id]}
                  >
                    {saving[setting.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
