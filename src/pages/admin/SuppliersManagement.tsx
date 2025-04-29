
import { useState } from 'react';
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
import { Search, MoreHorizontal, Plus, Edit, Trash, Eye, EyeOff, Star } from 'lucide-react';
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
import type { Supplier } from '@/types';

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
    shipping_methods: ['correios', 'transporter'],
    city: 'São Paulo',
    state: 'SP',
    categories: ['Casual', 'Fitness'],
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
    min_order: 'R$ 200,00',
    payment_methods: ['pix', 'bankslip'],
    requires_cnpj: false,
    avg_price: 'low',
    shipping_methods: ['correios'],
    city: 'Fortaleza',
    state: 'CE',
    categories: ['Acessórios'],
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
    categories: ['Plus Size'],
    featured: true,
    hidden: false,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

const CATEGORIES = [
  'Casual',
  'Fitness',
  'Plus Size',
  'Praia',
  'Acessórios',
  'Calçados',
  'Íntima',
  'Festa'
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function SuppliersManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  
  // Form state para novo fornecedor
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    images: [] as string[],
    instagram: '',
    whatsapp: '',
    website: '',
    min_order: '',
    payment_methods: ['pix'],
    requires_cnpj: false,
    avg_price: 'medium',
    shipping_methods: ['correios'],
    city: '',
    state: 'SP',
    categories: [] as string[],
    featured: false,
    hidden: false
  });
  
  // Filtragem de fornecedores
  const filteredSuppliers = MOCK_SUPPLIERS.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      supplier.categories.includes(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });
  
  // Manipulação de formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };
  
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const categories = [...prev.categories];
      if (categories.includes(category)) {
        return { ...prev, categories: categories.filter(c => c !== category) };
      } else {
        return { ...prev, categories: [...categories, category] };
      }
    });
  };
  
  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => {
      const methods = [...prev.payment_methods];
      if (methods.includes(method)) {
        return { ...prev, payment_methods: methods.filter(m => m !== method) };
      } else {
        return { ...prev, payment_methods: [...methods, method] };
      }
    });
  };
  
  const handleShippingMethodToggle = (method: string) => {
    setFormData(prev => {
      const methods = [...prev.shipping_methods];
      if (methods.includes(method)) {
        return { ...prev, shipping_methods: methods.filter(m => m !== method) };
      } else {
        return { ...prev, shipping_methods: [...methods, method] };
      }
    });
  };
  
  // Abrir modal para editar fornecedor
  const openEditModal = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setFormData({
      code: supplier.code,
      name: supplier.name,
      description: supplier.description,
      images: supplier.images || [],
      instagram: supplier.instagram || '',
      whatsapp: supplier.whatsapp || '',
      website: supplier.website || '',
      min_order: supplier.min_order || '',
      payment_methods: supplier.payment_methods,
      requires_cnpj: supplier.requires_cnpj,
      avg_price: supplier.avg_price,
      shipping_methods: supplier.shipping_methods,
      city: supplier.city,
      state: supplier.state,
      categories: supplier.categories,
      featured: supplier.featured,
      hidden: supplier.hidden
    });
    setIsEditMode(true);
    setIsAddSupplierOpen(true);
  };
  
  // Abrir modal para adicionar fornecedor
  const openAddModal = () => {
    setCurrentSupplier(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      images: [],
      instagram: '',
      whatsapp: '',
      website: '',
      min_order: '',
      payment_methods: ['pix'],
      requires_cnpj: false,
      avg_price: 'medium',
      shipping_methods: ['correios'],
      city: '',
      state: 'SP',
      categories: [],
      featured: false,
      hidden: false
    });
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
      // Aqui seria implementada a lógica para excluir no backend
      console.log('Excluindo fornecedor:', supplierToDelete.id);
      
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
  const handleSaveSupplier = () => {
    // Validação básica
    if (!formData.code || !formData.name || !formData.description || formData.categories.length === 0) {
      toast({
        title: "Erro ao salvar",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Aqui seria implementada a lógica para salvar no backend
    console.log('Salvando fornecedor:', formData);
    
    toast({
      title: isEditMode ? "Fornecedor atualizado" : "Fornecedor adicionado",
      description: `${formData.name} foi ${isEditMode ? "atualizado" : "adicionado"} com sucesso.`,
      variant: "default",
    });
    
    // Fechar modal
    setIsAddSupplierOpen(false);
  };
  
  // Alternar destaque de fornecedor
  const toggleFeatured = (supplier: Supplier) => {
    console.log(`Alterando destaque para ${supplier.name}: ${!supplier.featured}`);
    // Implementar lógica para atualizar no backend
    
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
    console.log(`Alterando visibilidade para ${supplier.name}: ${!supplier.hidden}`);
    // Implementar lógica para atualizar no backend
    
    toast({
      title: supplier.hidden ? "Fornecedor visível" : "Fornecedor oculto",
      description: supplier.hidden 
        ? `${supplier.name} agora está visível para usuários.` 
        : `${supplier.name} foi ocultado dos usuários.`,
      variant: "default",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Fornecedores</h1>
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
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
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
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
                        {supplier.hidden && (
                          <EyeOff className="ml-1 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map(category => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {supplier.city}, {supplier.state}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {supplier.hidden ? (
                        <Badge variant="outline" className="text-gray-500 border-gray-300">
                          Oculto
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          Visível
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(supplier)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(supplier)}>
                            <Star className="mr-2 h-4 w-4" />
                            <span>{supplier.featured ? 'Remover destaque' : 'Destacar'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleVisibility(supplier)}>
                            {supplier.hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Tornar visível</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                <span>Ocultar</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => confirmDelete(supplier)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
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
      </div>
      
      {/* Modal para adicionar/editar fornecedor */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Editar Fornecedor: ${currentSupplier?.name}` : 'Adicionar Novo Fornecedor'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do fornecedor abaixo. Campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Código e Nome */}
            <div className="space-y-2">
              <Label htmlFor="code">Código interno *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="ex: SP001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome do fornecedor *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome completo do fornecedor"
                required
              />
            </div>
            
            {/* Descrição */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva os produtos e serviços do fornecedor"
                rows={3}
                required
              />
            </div>
            
            {/* Upload de imagens */}
            <div className="space-y-2 md:col-span-2">
              <Label>Imagens do fornecedor</Label>
              <SupplierImageUpload 
                initialImages={formData.images} 
                onChange={handleImagesChange}
              />
            </div>
            
            {/* Contatos */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="@perfil"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="(99) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://exemplo.com.br"
              />
            </div>
            
            {/* Condições de compra */}
            <div className="space-y-2">
              <Label htmlFor="min_order">Pedido mínimo</Label>
              <Input
                id="min_order"
                name="min_order"
                value={formData.min_order}
                onChange={handleInputChange}
                placeholder="ex: R$ 300,00"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Preço médio</Label>
              <Select 
                value={formData.avg_price} 
                onValueChange={(value) => handleSelectChange('avg_price', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Requer CNPJ?</Label>
              <div className="flex items-center pt-2">
                <Checkbox 
                  id="requires_cnpj" 
                  checked={formData.requires_cnpj}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('requires_cnpj', checked as boolean)
                  }
                />
                <label
                  htmlFor="requires_cnpj"
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sim, exige CNPJ para compra
                </label>
              </div>
            </div>
            
            {/* Métodos de pagamento */}
            <div className="space-y-2 md:col-span-2">
              <Label>Formas de pagamento</Label>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="payment_pix" 
                    checked={formData.payment_methods.includes('pix')}
                    onCheckedChange={(checked) => {
                      if (checked) handlePaymentMethodToggle('pix');
                      else handlePaymentMethodToggle('pix');
                    }}
                  />
                  <label
                    htmlFor="payment_pix"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    PIX
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="payment_card" 
                    checked={formData.payment_methods.includes('card')}
                    onCheckedChange={(checked) => {
                      if (checked) handlePaymentMethodToggle('card');
                      else handlePaymentMethodToggle('card');
                    }}
                  />
                  <label
                    htmlFor="payment_card"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    Cartão
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="payment_bankslip" 
                    checked={formData.payment_methods.includes('bankslip')}
                    onCheckedChange={(checked) => {
                      if (checked) handlePaymentMethodToggle('bankslip');
                      else handlePaymentMethodToggle('bankslip');
                    }}
                  />
                  <label
                    htmlFor="payment_bankslip"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    Boleto
                  </label>
                </div>
              </div>
            </div>
            
            {/* Métodos de envio */}
            <div className="space-y-2 md:col-span-2">
              <Label>Formas de envio</Label>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center">
                  <Checkbox 
                    id="shipping_correios" 
                    checked={formData.shipping_methods.includes('correios')}
                    onCheckedChange={(checked) => {
                      if (checked) handleShippingMethodToggle('correios');
                      else handleShippingMethodToggle('correios');
                    }}
                  />
                  <label
                    htmlFor="shipping_correios"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    Correios
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="shipping_transporter" 
                    checked={formData.shipping_methods.includes('transporter')}
                    onCheckedChange={(checked) => {
                      if (checked) handleShippingMethodToggle('transporter');
                      else handleShippingMethodToggle('transporter');
                    }}
                  />
                  <label
                    htmlFor="shipping_transporter"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    Transportadora
                  </label>
                </div>
                
                <div className="flex items-center">
                  <Checkbox 
                    id="shipping_delivery" 
                    checked={formData.shipping_methods.includes('delivery')}
                    onCheckedChange={(checked) => {
                      if (checked) handleShippingMethodToggle('delivery');
                      else handleShippingMethodToggle('delivery');
                    }}
                  />
                  <label
                    htmlFor="shipping_delivery"
                    className="ml-2 text-sm font-medium leading-none"
                  >
                    Entrega local
                  </label>
                </div>
              </div>
            </div>
            
            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Nome da cidade"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select 
                value={formData.state} 
                onValueChange={(value) => handleSelectChange('state', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Categorias */}
            <div className="space-y-2 md:col-span-2">
              <Label>Categorias de produtos *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                {CATEGORIES.map(category => (
                  <div key={category} className="flex items-center">
                    <Checkbox 
                      id={`category_${category}`} 
                      checked={formData.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) handleCategoryToggle(category);
                        else handleCategoryToggle(category);
                      }}
                    />
                    <label
                      htmlFor={`category_${category}`}
                      className="ml-2 text-sm font-medium leading-none"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Opções adicionais */}
            <div className="md:col-span-2 space-y-4 pt-2">
              <div className="flex items-center">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('featured', checked as boolean)
                  }
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm font-medium leading-none"
                >
                  Destacar este fornecedor
                </label>
              </div>
              
              <div className="flex items-center">
                <Checkbox 
                  id="hidden" 
                  checked={formData.hidden}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('hidden', checked as boolean)
                  }
                />
                <label
                  htmlFor="hidden"
                  className="ml-2 text-sm font-medium leading-none"
                >
                  Ocultar este fornecedor (não será visível para os usuários)
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSupplier}>
              {isEditMode ? 'Salvar alterações' : 'Adicionar fornecedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor {supplierToDelete?.name}? 
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSupplier} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
