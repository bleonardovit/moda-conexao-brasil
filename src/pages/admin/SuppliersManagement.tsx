import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, Plus, Edit, Trash, Eye, EyeOff, Star, Save, Upload, Plane, Bus, Download } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SupplierImageUpload } from '@/components/admin/SupplierImageUpload';
import { CategorySelector } from '@/components/admin/CategorySelector';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { supplierFormSchema, type SupplierFormValues } from '@/lib/validators/supplier-form';
import type { Supplier, Category } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Dados de exemplo
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    code: 'SP001',
    name: 'Moda Fashion SP',
    description: 'Atacado de roupas femininas com foco em tendências atuais',
    images: ['/placeholder.svg'],
    instagram: '@modafashionsp',
    whatsapp: '+5511999999999',
    min_order: 'R$ 300,00',
    payment_methods: ['pix', 'card', 'bankslip'],
    requires_cnpj: true,
    avg_price: 'medium',
    shipping_methods: ['correios', 'delivery', 'transporter'],
    city: 'São Paulo',
    state: 'SP',
    categories: ['1', '2'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2',
    code: 'CE001',
    name: 'Brindes Fortaleza',
    description: 'Acessórios e bijuterias para revenda',
    images: ['/placeholder.svg'],
    instagram: '@brindesfortaleza',
    whatsapp: '+5585999999999',
    min_order: '15 peças',
    payment_methods: ['pix', 'bankslip'],
    requires_cnpj: false,
    avg_price: 'low',
    shipping_methods: ['correios'],
    city: 'Fortaleza',
    state: 'CE',
    categories: ['4'],
    featured: false,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '3',
    code: 'GO001',
    name: 'Plus Size Goiânia',
    description: 'Especializada em moda plus size feminina',
    images: ['/placeholder.svg'],
    instagram: '@plussizegoiania',
    whatsapp: '+5562999999999',
    website: 'https://plussizegoiania.com.br',
    min_order: 'R$ 500,00',
    payment_methods: ['pix', 'card'],
    requires_cnpj: true,
    avg_price: 'medium',
    shipping_methods: ['correios', 'transporter'],
    city: 'Goiânia',
    state: 'GO',
    categories: ['3'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

// Dados de exemplo para categorias
const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Casual',
    description: 'Roupas para uso diário',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '2',
    name: 'Fitness',
    description: 'Roupas esportivas e fitness',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '3',
    name: 'Plus Size',
    description: 'Moda em tamanhos maiores',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '4',
    name: 'Acessórios',
    description: 'Bolsas, cintos, bijuterias etc',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  },
  {
    id: '5',
    name: 'Praia',
    description: 'Roupas de praia e verão',
    created_at: '2025-04-01T10:30:00Z',
    updated_at: '2025-04-01T10:30:00Z'
  }
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Interface para erros de importação
interface ImportError {
  row: number;
  errors: string[];
}

// Componente para o formulário de fornecedor
const SupplierForm: React.FC<{
  onSave: (data: SupplierFormValues) => void;
  onCancel: () => void;
  initialData?: Supplier;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
}> = ({ onSave, onCancel, initialData, categories, onAddCategory }) => {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      custom_shipping_method: initialData.custom_shipping_method || ''
    } : {
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
      state: 'SP',
      categories: [],
      featured: false,
      hidden: false,
    }
  });
  
  // Estado para controlar etapas do formulário
  const [step, setStep] = useState<'basic' | 'details' | 'commercial'>('basic');
  
  function onSubmit(values: SupplierFormValues) {
    onSave(values);
  }

  // Manipulação de imagens
  const handleImagesChange = (images: string[]) => {
    form.setValue('images', images);
  };

  // Verificar se um método de transporte personalizado está selecionado
  const hasCustomShipping = form.watch('shipping_methods').includes('custom');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={step} onValueChange={(value) => setStep(value as any)}>
          <TabsList className="mb-6 mx-auto w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="basic" className="rounded-l-md">
              Dados Básicos
            </TabsTrigger>
            <TabsTrigger value="commercial">
              Condições Comerciais
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-r-md">
              Detalhes e Categorias
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código interno *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: SP001" {...field} />
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
                    <FormLabel>Nome do fornecedor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do fornecedor" {...field} />
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
                    <Textarea 
                      placeholder="Descreva os produtos e serviços do fornecedor" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Imagens do fornecedor</FormLabel>
                  <FormControl>
                    <SupplierImageUpload 
                      initialImages={form.getValues('images')} 
                      onChange={handleImagesChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="@perfil" {...field} />
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
                      <Input placeholder="(99) 99999-9999" {...field} />
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
                      <Input placeholder="https://exemplo.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep('commercial')}>
                Próximo
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="commercial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido mínimo</FormLabel>
                    <FormDescription>
                      Valor em reais ou quantidade de peças
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="ex: R$ 300,00 ou 10 peças" {...field} />
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
                    <FormLabel>Preço médio</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o preço médio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixo (0 a R$ 60,00)</SelectItem>
                        <SelectItem value="medium">Médio (R$ 70,00 a R$ 140,00)</SelectItem>
                        <SelectItem value="high">Alto (acima de R$ 150,00)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="requires_cnpj"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Requer CNPJ para compra
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="payment_methods"
              render={() => (
                <FormItem>
                  <FormLabel>Formas de pagamento *</FormLabel>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pix"
                            checked={field.value?.includes('pix')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'pix']);
                              } else {
                                field.onChange(current.filter(v => v !== 'pix'));
                              }
                            }}
                          />
                          <label
                            htmlFor="pix"
                            className="text-sm font-medium leading-none"
                          >
                            PIX
                          </label>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="card"
                            checked={field.value?.includes('card')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'card']);
                              } else {
                                field.onChange(current.filter(v => v !== 'card'));
                              }
                            }}
                          />
                          <label
                            htmlFor="card"
                            className="text-sm font-medium leading-none"
                          >
                            Cartão
                          </label>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="payment_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bankslip"
                            checked={field.value?.includes('bankslip')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'bankslip']);
                              } else {
                                field.onChange(current.filter(v => v !== 'bankslip'));
                              }
                            }}
                          />
                          <label
                            htmlFor="bankslip"
                            className="text-sm font-medium leading-none"
                          >
                            Boleto
                          </label>
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="shipping_methods"
              render={() => (
                <FormItem>
                  <FormLabel>Formas de envio *</FormLabel>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="correios"
                            checked={field.value?.includes('correios')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'correios']);
                              } else {
                                field.onChange(current.filter(v => v !== 'correios'));
                              }
                            }}
                          />
                          <label
                            htmlFor="correios"
                            className="text-sm font-medium leading-none"
                          >
                            Correios
                          </label>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="transporter"
                            checked={field.value?.includes('transporter')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'transporter']);
                              } else {
                                field.onChange(current.filter(v => v !== 'transporter'));
                              }
                            }}
                          />
                          <label
                            htmlFor="transporter"
                            className="text-sm font-medium leading-none"
                          >
                            Transportadora
                          </label>
                        </div>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="delivery"
                            checked={field.value?.includes('delivery')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'delivery']);
                              } else {
                                field.onChange(current.filter(v => v !== 'delivery'));
                              }
                            }}
                          />
                          <label
                            htmlFor="delivery"
                            className="text-sm font-medium leading-none"
                          >
                            Entrega local
                          </label>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="excursion"
                            checked={field.value?.includes('excursion')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'excursion']);
                              } else {
                                field.onChange(current.filter(v => v !== 'excursion'));
                              }
                            }}
                          />
                          <label
                            htmlFor="excursion"
                            className="text-sm font-medium leading-none flex items-center"
                          >
                            <Bus className="h-3 w-3 mr-1" />
                            Excursão
                          </label>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="air"
                            checked={field.value?.includes('air')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'air']);
                              } else {
                                field.onChange(current.filter(v => v !== 'air'));
                              }
                            }}
                          />
                          <label
                            htmlFor="air"
                            className="text-sm font-medium leading-none flex items-center"
                          >
                            <Plane className="h-3 w-3 mr-1" />
                            Aéreo
                          </label>
                        </div>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_methods"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="custom"
                            checked={field.value?.includes('custom')}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, 'custom']);
                              } else {
                                field.onChange(current.filter(v => v !== 'custom'));
                              }
                            }}
                          />
                          <label
                            htmlFor="custom"
                            className="text-sm font-medium leading-none"
                          >
                            Outro
                          </label>
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasCustomShipping && (
              <FormField
                control={form.control}
                name="custom_shipping_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especifique o método de envio</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o método de envio personalizado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep('basic')}>
                Voltar
              </Button>
              <Button type="button" onClick={() => setStep('details')}>
                Próximo
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} />
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <CategorySelector
                    categories={categories}
                    selectedCategories={field.value || []}
                    onChange={(value) => {
                      field.onChange(value);
                      form.setValue('categories', value, { shouldValidate: true });
                    }}
                    onAddCategory={onAddCategory}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Destacar este fornecedor
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Ocultar este fornecedor (não será visível para os usuários)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep('commercial')}>
                Voltar
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Fornecedor
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

// Componente para exibir erros de importação
const ImportErrorsDisplay: React.FC<{ errors: ImportError[] }> = ({ errors }) => {
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium">Erros encontrados ({errors.length})</h3>
      <Accordion type="single" collapsible className="w-full">
        {errors.map((error, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-red-600 hover:no-underline">
              Linha {error.row}: {error.errors[0]}
              {error.errors.length > 1 && ` (+ ${error.errors.length - 1} erros)`}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1">
                {error.errors.map((err, idx) => (
                  <li key={idx} className="text-sm text-red-600">{err}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default function SuppliersManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  // Dados para fornecedores e categorias
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  
  // Tab atual
  const [currentTab, setCurrentTab] = useState<'suppliers' | 'categories'>('suppliers');
  
  // Filtragem de fornecedores
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      supplier.categories.includes(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });
  
  // Função para adicionar uma categoria
  const addCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const newCategory: Category = {
      id: `${categories.length + 1}`,
      name: categoryData.name,
      description: categoryData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setCategories([...categories, newCategory]);
    
    toast({
      title: "Categoria adicionada",
      description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
      variant: "default",
    });
    
    return newCategory.id;
  };
  
  // Abrir modal para editar fornecedor
  const openEditModal = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsEditMode(true);
    setIsAddSupplierOpen(true);
  };
  
  // Abrir modal para adicionar fornecedor
  const openAddModal = () => {
    setCurrentSupplier(null);
    setIsEditMode(false);
    setIsAddSupplierOpen(true);
  };
  
  // Confirmar exclusão de fornecedor
  const confirmDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };
  
  // Excluir fornecedor
  const deleteSupplier = () => {
    if (supplierToDelete) {
      const updatedSuppliers = suppliers.filter(s => s.id !== supplierToDelete.id);
      setSuppliers(updatedSuppliers);
      
      toast({
        title: "Fornecedor excluído",
        description: `${supplierToDelete.name} foi removido com sucesso.`,
        variant: "default",
      });
      
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };
  
  // Salvar fornecedor (novo ou editado)
  const handleSaveSupplier = (data: SupplierFormValues) => {
    if (isEditMode && currentSupplier) {
      // Editar fornecedor existente
      const updatedSuppliers = suppliers.map(s => 
        s.id === currentSupplier.id ? { 
          ...s, 
          ...data, 
          updated_at: new Date().toISOString()
        } : s
      );
      
      setSuppliers(updatedSuppliers);
      
      toast({
        title: "Fornecedor atualizado",
        description: `${data.name} foi atualizado com sucesso.`,
        variant: "default",
      });
    } else {
      // Adicionar novo fornecedor
      // Ensure all required fields are present
      const newSupplier: Supplier = {
        id: `${suppliers.length + 1}`,
        code: data.code,
        name: data.name,
        description: data.description,
        images: data.images || [],
        instagram: data.instagram || '',
        whatsapp: data.whatsapp || '',
        website: data.website || '',
        min_order: data.min_order || '',
        payment_methods: data.payment_methods,
        requires_cnpj: data.requires_cnpj,
        avg_price: data.avg_price,
        shipping_methods: data.shipping_methods,
        custom_shipping_method: data.custom_shipping_method,
        city: data.city,
        state: data.state,
        categories: data.categories,
        featured: data.featured,
        hidden: data.hidden,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setSuppliers([...suppliers, newSupplier]);
      
      toast({
        title: "Fornecedor adicionado",
        description: `${data.name} foi adicionado com sucesso.`,
        variant: "default",
      });
    }
    
    // Fechar modal
    setIsAddSupplierOpen(false);
  };
  
  // Alternar destaque de fornecedor
  const toggleFeatured = (supplier: Supplier) => {
    const updatedSuppliers = suppliers.map(s => 
      s.id === supplier.id ? { ...s, featured: !s.featured } : s
    );
    
    setSuppliers(updatedSuppliers);
    
    toast({
      title: !supplier.featured ? "Fornecedor destacado" : "Destaque removido",
      description: !supplier.featured 
        ? `${supplier.name} agora aparecerá como destaque.` 
        : `${supplier.name} não aparecerá mais como destaque.`,
      variant: "default",
    });
  };
  
  // Alternar visibilidade de fornecedor
  const toggleVisibility = (supplier: Supplier) => {
    const updatedSuppliers = suppliers.map(s => 
      s.id === supplier.id ? { ...s, hidden: !s.hidden } : s
    );
    
    setSuppliers(updatedSuppliers);
    
    toast({
      title: supplier.hidden ? "Fornecedor visível" : "Fornecedor oculto",
      description: supplier.hidden 
        ? `${supplier.name} agora está visível para usuários.` 
        : `${supplier.name} foi ocultado dos usuários.`,
      variant: "default",
    });
  };
  
  // Obter nome da categoria a partir do ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  return (
    <AdminLayout>
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList className="mb-6 w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="suppliers" className="rounded-l-md">
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-r-md">
            Categorias
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gerenciamento de Fornecedores</h1>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/suppliers/bulk-upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Importação em Massa
                </Link>
              </Button>
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tabela de fornecedores */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Categorias</TableHead>
                  <TableHead className="hidden sm:table-cell">Localização</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.code}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {supplier.name}
                          {supplier.featured && (
                            <Star className="ml-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {supplier.categories.map(categoryId => (
                            <Badge key={categoryId} variant="outline" className="text-xs">
                              {getCategoryName(categoryId)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {`${supplier.city}, ${supplier.state}`}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {supplier.hidden ? (
                          <Badge variant="outline" className="text-xs bg-gray-100">Oculto</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Visível</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditModal(supplier)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeatured(supplier)}>
                              <Star className="mr-2 h-4 w-4" />
                              {supplier.featured ? 'Remover destaque' : 'Destacar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleVisibility(supplier)}>
                              {supplier.hidden ? (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Tornar visível
                                </>
                              ) : (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Ocultar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => confirmDelete(supplier)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum fornecedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <CategoryManagement 
            categories={categories}
            setCategories={setCategories}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modal para adicionar/editar fornecedor */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Altere os dados do fornecedor conforme necessário.' 
                : 'Preencha os dados para adicionar um novo fornecedor.'}
            </DialogDescription>
          </DialogHeader>
          
          <SupplierForm
            onSave={handleSaveSupplier}
            onCancel={() => setIsAddSupplierOpen(false)}
            initialData={currentSupplier || undefined}
            categories={categories}
            onAddCategory={addCategory}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o fornecedor{' '}
              <span className="font-semibold">{supplierToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSupplier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
