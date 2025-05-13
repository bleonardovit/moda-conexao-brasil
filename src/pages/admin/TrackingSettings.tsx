
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  getTrackingSettings, 
  updateTrackingSetting, 
  validateTrackingFormat, 
  TrackingSettings as TrackingSettingsType 
} from '@/services/settingsService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { AlertCircle, Info, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TrackingSettings = () => {
  const [settings, setSettings] = useState<TrackingSettingsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await getTrackingSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load tracking settings:', error);
        toast({
          title: 'Erro ao carregar configurações',
          description: 'Não foi possível carregar as configurações de rastreamento.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggleActive = async (setting: TrackingSettingsType) => {
    try {
      const updated = await updateTrackingSetting(setting.id, {
        is_active: !setting.is_active,
      });

      if (updated) {
        setSettings(prev => 
          prev.map(s => s.id === setting.id ? { ...s, is_active: !s.is_active } : s)
        );
      }
    } catch (error) {
      console.error('Failed to toggle setting:', error);
    }
  };

  const handleSaveValue = async (setting: TrackingSettingsType, newValue: string) => {
    if (!validateTrackingFormat(setting.key, newValue)) {
      toast({
        title: 'Formato inválido',
        description: `O formato para ${setting.name} é inválido. Por favor, verifique e tente novamente.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const updated = await updateTrackingSetting(setting.id, {
        value: newValue || null,
      });

      if (updated) {
        setSettings(prev => 
          prev.map(s => s.id === setting.id ? { ...s, value: newValue || null } : s)
        );
        toast({
          title: 'Configuração atualizada',
          description: `${setting.name} foi atualizado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Failed to update setting value:', error);
    }
  };

  const handleSaveScript = async (setting: TrackingSettingsType, newScript: string) => {
    try {
      const updated = await updateTrackingSetting(setting.id, {
        script: newScript || null,
      });

      if (updated) {
        setSettings(prev => 
          prev.map(s => s.id === setting.id ? { ...s, script: newScript || null } : s)
        );
        toast({
          title: 'Script atualizado',
          description: `${setting.name} foi atualizado com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Failed to update script:', error);
    }
  };

  const renderValueHelp = (key: string) => {
    switch (key) {
      case 'facebook_pixel':
        return 'Formato esperado: 15 dígitos (ex: 123456789012345)';
      case 'gtm':
        return 'Formato esperado: GTM-XXXXXX (ex: GTM-ABC123)';
      case 'hotjar':
        return 'Formato esperado: números (ex: 1234567)';
      case 'custom_script':
        return 'Insira código JavaScript ou HTML personalizado';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">Carregando configurações...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Configurações de Rastreamento</h1>
        <p className="text-muted-foreground">
          Gerencie as ferramentas de rastreamento e análise do seu site.
        </p>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => (
          <Card key={setting.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{setting.name}</CardTitle>
                  <CardDescription>{renderValueHelp(setting.key)}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${setting.id}`} className="text-sm font-medium">
                    {setting.is_active ? 'Ativo' : 'Inativo'}
                  </Label>
                  <Switch
                    id={`active-${setting.id}`}
                    checked={setting.is_active}
                    onCheckedChange={() => handleToggleActive(setting)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {setting.key === 'custom_script' ? (
                <div className="space-y-2">
                  <Label htmlFor={`script-${setting.id}`}>Código Personalizado</Label>
                  <Textarea
                    id={`script-${setting.id}`}
                    placeholder="<!-- Insira seu código HTML ou JavaScript aqui -->"
                    rows={5}
                    defaultValue={setting.script || ''}
                    className="font-mono text-sm"
                  />
                  <Alert variant="outline" className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Este código será injetado no final da página. Tenha cuidado ao inserir códigos de terceiros.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={(e) => {
                      const textarea = document.getElementById(`script-${setting.id}`) as HTMLTextAreaElement;
                      handleSaveScript(setting, textarea.value);
                    }}
                    size="sm"
                    className="mt-2"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Script
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`value-${setting.id}`}>ID da Ferramenta</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`value-${setting.id}`}
                      placeholder={`Insira o ID do ${setting.name}`}
                      defaultValue={setting.value || ''}
                      className="flex-1"
                    />
                    <Button 
                      onClick={(e) => {
                        const input = document.getElementById(`value-${setting.id}`) as HTMLInputElement;
                        handleSaveValue(setting, input.value);
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default TrackingSettings;
