import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define the tracking setting type
interface TrackingSetting {
  id: string;
  key: string;
  name: string;
  value: string | null;
  script: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  meta_access_token?: string | null; // <-- add support for meta_access_token
}

// Define the form schema with validation
const trackingFormSchema = z.object({
  facebook_pixel: z.string().optional()
    .refine(val => !val || /^\d+$/.test(val), {
      message: "Facebook Pixel ID deve ser um número",
    }),
  google_tag_manager: z.string().optional()
    .refine(val => !val || /^GTM-[A-Z0-9]+$/.test(val), {
      message: "Google Tag Manager ID deve seguir o formato GTM-XXXXXX",
    }),
  hotjar: z.string().optional()
    .refine(val => !val || /^\d+$/.test(val), {
      message: "Hotjar ID deve ser um número",
    }),
  custom_script: z.string().optional(),
  facebook_pixel_active: z.boolean().default(false),
  google_tag_manager_active: z.boolean().default(false),
  hotjar_active: z.boolean().default(false),
  custom_script_active: z.boolean().default(false),
  meta_access_token: z.string().optional(),
  meta_conversions_api_active: z.boolean().default(false),
});

type TrackingFormValues = z.infer<typeof trackingFormSchema>;

export default function TrackingSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set up form
  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingFormSchema),
    defaultValues: {
      facebook_pixel: '',
      google_tag_manager: '',
      hotjar: '',
      custom_script: '',
      facebook_pixel_active: false,
      google_tag_manager_active: false,
      hotjar_active: false,
      custom_script_active: false,
      meta_access_token: '',
      meta_conversions_api_active: false,
    }
  });

  // Fetch tracking settings from the database
  const { data: trackingSettings, isLoading, isError } = useQuery({
    queryKey: ['trackingSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_settings')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      return data as TrackingSetting[];
    }
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (trackingSettings) {
      const formValues: Partial<TrackingFormValues> = {};
      
      trackingSettings.forEach((setting) => {
        switch(setting.key) {
          case 'facebook_pixel':
            formValues.facebook_pixel = setting.value || '';
            formValues.facebook_pixel_active = setting.is_active;
            break;
          case 'google_tag_manager':
            formValues.google_tag_manager = setting.value || '';
            formValues.google_tag_manager_active = setting.is_active;
            break;
          case 'hotjar':
            formValues.hotjar = setting.value || '';
            formValues.hotjar_active = setting.is_active;
            break;
          case 'custom_script':
            formValues.custom_script = setting.script || '';
            formValues.custom_script_active = setting.is_active;
            break;
          case 'meta_conversions_api':
            formValues.meta_access_token = setting.meta_access_token || '';
            formValues.meta_conversions_api_active = setting.is_active;
            break;
        }
      });
      
      form.reset(formValues);
    }
  }, [trackingSettings, form]);

  // Create or update a tracking setting
  const updateSettingMutation = useMutation({
    mutationFn: async (data: {
      key: string;
      name: string;
      value?: string | null;
      script?: string | null;
      is_active: boolean;
      meta_access_token?: string | null;
    }) => {
      // Check if setting exists
      const { data: existingSettings } = await supabase
        .from('tracking_settings')
        .select('id')
        .eq('key', data.key)
        .limit(1);

      if (existingSettings && existingSettings.length > 0) {
        // Update existing setting
        // Always include key and name for typings
        const updateObject: {
          key: string;
          name: string;
          value?: string | null;
          script?: string | null;
          is_active: boolean;
          updated_at: string;
          meta_access_token?: string | null;
        } = {
          key: data.key,
          name: data.name,
          value: data.value,
          script: data.script,
          is_active: data.is_active,
          updated_at: new Date().toISOString(),
        };
        if (data.meta_access_token !== undefined) {
          updateObject.meta_access_token = data.meta_access_token;
        }
        const { error } = await supabase
          .from('tracking_settings')
          .update(updateObject)
          .eq('key', data.key);
        
        if (error) throw error;
      } else {
        // Create new setting
        const insertObject: {
          key: string;
          name: string;
          value?: string | null;
          script?: string | null;
          is_active: boolean;
          meta_access_token?: string | null;
        } = {
          key: data.key,
          name: data.name,
          value: data.value,
          script: data.script,
          is_active: data.is_active,
        };
        if (data.meta_access_token !== undefined) {
          insertObject.meta_access_token = data.meta_access_token;
        }
        const { error } = await supabase
          .from('tracking_settings')
          .insert(insertObject);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackingSettings'] });
    }
  });

  // Handle form submission
  const onSubmit = async (values: TrackingFormValues) => {
    try {
      setError(null);
      setSuccess(null);

      // Process Facebook Pixel
      await updateSettingMutation.mutateAsync({
        key: 'facebook_pixel',
        name: 'Facebook Pixel',
        value: values.facebook_pixel || null,
        script: null,
        is_active: values.facebook_pixel_active
      });

      // Process Google Tag Manager
      await updateSettingMutation.mutateAsync({
        key: 'google_tag_manager',
        name: 'Google Tag Manager',
        value: values.google_tag_manager || null,
        script: null,
        is_active: values.google_tag_manager_active
      });

      // Process Hotjar
      await updateSettingMutation.mutateAsync({
        key: 'hotjar',
        name: 'Hotjar',
        value: values.hotjar || null,
        script: null,
        is_active: values.hotjar_active
      });

      // Process Custom Script
      await updateSettingMutation.mutateAsync({
        key: 'custom_script',
        name: 'Script Personalizado',
        value: null,
        script: values.custom_script || null,
        is_active: values.custom_script_active
      });

      // Process Meta Conversions API
      await updateSettingMutation.mutateAsync({
        key: 'meta_conversions_api',
        name: 'Meta Conversions API',
        value: null,
        script: null,
        meta_access_token: values.meta_access_token || null,
        is_active: values.meta_conversions_api_active
      });

      // Show success message
      setSuccess("Configurações de rastreamento atualizadas com sucesso!");
      toast({
        title: "Sucesso!",
        description: "Configurações de rastreamento atualizadas com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Ocorreu um erro ao salvar as configurações. Tente novamente.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações de rastreamento.",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Configurações de Rastreamento</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-500 text-green-500">
            <AlertTitle>Sucesso</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Códigos de Rastreamento</CardTitle>
            <CardDescription>
              Configure os serviços de análise e rastreamento para a aplicação.
              Os scripts serão carregados automaticamente quando ativados.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Facebook Pixel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Facebook Pixel</h3>
                    <FormField
                      control={form.control}
                      name="facebook_pixel_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Ativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="facebook_pixel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Facebook Pixel</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789012345" {...field} />
                        </FormControl>
                        <FormDescription>
                          Insira apenas o ID numérico do seu Facebook Pixel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Google Tag Manager */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Google Tag Manager</h3>
                    <FormField
                      control={form.control}
                      name="google_tag_manager_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Ativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="google_tag_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Google Tag Manager</FormLabel>
                        <FormControl>
                          <Input placeholder="GTM-XXXXXX" {...field} />
                        </FormControl>
                        <FormDescription>
                          Insira o ID no formato GTM-XXXXXX.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Hotjar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Hotjar</h3>
                    <FormField
                      control={form.control}
                      name="hotjar_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Ativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="hotjar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID do Site Hotjar</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Insira apenas o ID numérico do seu site no Hotjar.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Custom Script */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Script Personalizado</h3>
                    <FormField
                      control={form.control}
                      name="custom_script_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Ativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="custom_script"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Script Personalizado</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="<script>...</script>"
                            className="h-32 font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Insira qualquer código JavaScript ou HTML que será injetado na página.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Meta Conversions API */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Meta Conversions API</h3>
                    <FormField
                      control={form.control}
                      name="meta_conversions_api_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormLabel>Ativar</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="meta_access_token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access Token da Conversions API</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="EAABsb... (token fornecido pelo Meta)"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Informe o token de acesso da sua Conversions API no Meta for Developers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}
