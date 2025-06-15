
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierFormSchema, type SupplierFormValues } from '@/lib/validators/supplier-form';
import { createSupplierMutation, updateSupplierMutation } from '@/services/supplierService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { brazilianStates } from '@/data/brazilian-states';
import { SupplierImageUpload } from './SupplierImageUpload';
import type { Supplier, PaymentMethod, ShippingMethod } from '@/types';

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierFormModal({ open, onClose, supplier, onSuccess }: SupplierFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();
  const isEditing = !!supplier;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      images: [],
      instagram: '',
      whatsapp: '',
      website: '',
      min_order: '',
      payment_methods: [],
      requires_cnpj: false,
      avg_price: undefined,
      shipping_methods: [],
      custom_shipping_method: '',
      city: '',
      state: '',
      categories: [],
      featured: false,
      hidden: false,
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Reset form when supplier changes
  useEffect(() => {
    if (supplier && open) {
      form.reset({
        code: supplier.code || '',
        name: supplier.name || '',
        description: supplier.description || '',
        images: supplier.images || [],
        instagram: supplier.instagram || '',
        whatsapp: supplier.whatsapp || '',
        website: supplier.website || '',
        min_order: supplier.min_order || '',
        payment_methods: supplier.payment_methods || [],
        requires_cnpj: supplier.requires_cnpj || false,
        avg_price: supplier.avg_price || undefined,
        shipping_methods: supplier.shipping_methods || [],
        custom_shipping_method: supplier.custom_shipping_method || '',
        city: supplier.city || '',
        state: supplier.state || '',
        categories: supplier.categories || [],
        featured: supplier.featured || false,
        hidden: supplier.hidden || false,
      });
    } else if (!supplier && open) {
      form.reset({
        code: '',
        name: '',
        description: '',
        images: [],
        instagram: '',
        whatsapp: '',
        website: '',
        min_order: '',
        payment_methods: [],
        requires_cnpj: false,
        avg_price: undefined,
        shipping_methods: [],
        custom_shipping_method: '',
        city: '',
        state: '',
        categories: [],
        featured: false,
        hidden: false,
      });
    }
    // Reset to first tab when modal opens
    if (open) {
      setActiveTab('basic');
    }
  }, [supplier, open, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && supplier) {
        await updateSupplierMutation(supplier.id, data);
        toast({
          title: "Fornecedor atualizado",
          description: "Os dados do fornecedor foram atualizados com sucesso.",
        });
      } else {
        await createSupplierMutation(data);
        toast({
          title: "Fornecedor criado",
          description: "O fornecedor foi criado com sucesso.",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Erro",
        description: `Erro ao ${isEditing ? 'atualizar' : 'criar'} fornecedor. Tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    const current = form.getValues('payment_methods') || [];
    if (!current.includes(method)) {
      form.setValue('payment_methods', [...current, method]);
    }
  };

  const removePaymentMethod = (method: PaymentMethod) => {
    const current = form.getValues('payment_methods') || [];
    form.setValue('payment_methods', current.filter(m => m !== method));
  };

  const addShippingMethod = (method: ShippingMethod) => {
    const current = form.getValues('shipping_methods') || [];
    if (!current.includes(method)) {
      form.setValue('shipping_methods', [...current, method]);
    }
  };

  const removeShippingMethod = (method: ShippingMethod) => {
    const current = form.getValues('shipping_methods') || [];
    form.setValue('shipping_methods', current.filter(m => m !== method));
  };

  const handleImagesChange = (images: string[]) => {
    form.setValue('images', images);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="business">Negócio</TabsTrigger>
                <TabsTrigger value="images">Imagens</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código único do fornecedor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do fornecedor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição do fornecedor" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilianStates.map(state => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Categorias *</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={(form.watch('categories') || []).includes(category.id)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues('categories') || [];
                            if (checked) {
                              form.setValue('categories', [...current, category.id]);
                            } else {
                              form.setValue('categories', current.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <label htmlFor={category.id} className="text-sm font-medium">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="@usuario" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(11) 99999-9999" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="business" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pedido Mínimo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: R$ 100 ou 50 peças" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avg_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Médio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixo</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <FormLabel>Métodos de Pagamento</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPaymentMethod('pix')}
                      >
                        PIX
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPaymentMethod('card')}
                      >
                        Cartão
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPaymentMethod('bankslip')}
                      >
                        Boleto
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(form.watch('payment_methods') || []).map(method => (
                        <Badge key={method} variant="secondary" className="flex items-center gap-1">
                          {method === 'pix' ? 'PIX' : method === 'card' ? 'Cartão' : 'Boleto'}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removePaymentMethod(method)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Métodos de Envio</FormLabel>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addShippingMethod('correios')}
                      >
                        Correios
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addShippingMethod('delivery')}
                      >
                        Delivery
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addShippingMethod('transporter')}
                      >
                        Transportadora
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addShippingMethod('excursion')}
                      >
                        Excursão
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addShippingMethod('air')}
                      >
                        Aéreo
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(form.watch('shipping_methods') || []).map(method => (
                        <Badge key={method} variant="secondary" className="flex items-center gap-1">
                          {method === 'correios' ? 'Correios' : 
                           method === 'delivery' ? 'Delivery' :
                           method === 'transporter' ? 'Transportadora' :
                           method === 'excursion' ? 'Excursão' :
                           method === 'air' ? 'Aéreo' : method}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeShippingMethod(method)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <FormField
                    control={form.control}
                    name="requires_cnpj"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Requer CNPJ</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Destaque</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hidden"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Oculto</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-6">
                <div>
                  <FormLabel>Imagens do Fornecedor</FormLabel>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione imagens para representar o fornecedor. Você pode fazer upload de múltiplas imagens.
                  </p>
                  <SupplierImageUpload
                    initialImages={form.watch('images') || []}
                    onChange={handleImagesChange}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'} Fornecedor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
