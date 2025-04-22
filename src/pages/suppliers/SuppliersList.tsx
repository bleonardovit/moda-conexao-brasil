import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, Instagram, Link as LinkIcon } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import type { Supplier } from '@/types';

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    code: 'SP001',
    name: 'Moda Fashion SP',
    description: 'Atacado de roupas femininas com foco em tendências atuais',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'],
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
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb'],
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
    images: ['https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'],
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
  { label: 'Todas', value: 'all' },
  { label: 'Casual', value: 'Casual' },
  { label: 'Fitness', value: 'Fitness' },
  { label: 'Plus Size', value: 'Plus Size' },
  { label: 'Praia', value: 'Praia' },
  { label: 'Acessórios', value: 'Acessórios' }
];

const STATES = [
  { label: 'Todos', value: 'all' },
  { label: 'São Paulo', value: 'SP' },
  { label: 'Ceará', value: 'CE' },
  { label: 'Goiás', value: 'GO' },
  { label: 'Pernambuco', value: 'PE' }
];

export default function SuppliersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredSuppliers = MOCK_SUPPLIERS.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || 
      supplier.categories.includes(categoryFilter);
    
    const matchesState = stateFilter === 'all' || 
      supplier.state === stateFilter;
    
    return matchesSearch && matchesCategory && matchesState;
  });

  const formatAvgPrice = (price: string) => {
    switch(price) {
      case 'low': return 'Baixo';
      case 'medium': return 'Médio';
      case 'high': return 'Alto';
      default: return 'Não informado';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {filteredSuppliers.length} fornecedores encontrados
          </span>
        </div>
        
        {isFilterOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted rounded-md">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select 
                value={stateFilter} 
                onValueChange={setStateFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="overflow-hidden">
                <div className="sm:flex">
                  <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent">
                    <img 
                      src={supplier.images[0]} 
                      alt={supplier.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="sm:w-2/3 md:w-3/4 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{supplier.city}, {supplier.state}</p>
                      </div>
                      {supplier.featured && (
                        <Badge className="bg-brand-purple text-white">Destaque</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm mb-4 line-clamp-2">{supplier.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {supplier.categories.map(category => (
                        <Badge key={category} variant="outline">{category}</Badge>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="font-medium">Pedido mínimo:</span> {supplier.min_order}
                      </div>
                      <div>
                        <span className="font-medium">Preço médio:</span> {formatAvgPrice(supplier.avg_price)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {supplier.instagram && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`https://instagram.com/${supplier.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                            <Instagram className="mr-1 h-4 w-4" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      
                      {supplier.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-1 h-4 w-4" />
                            Site
                          </a>
                        </Button>
                      )}
                      
                      <Button size="sm" asChild>
                        <Link to={`/suppliers/${supplier.id}`}>
                          Ver detalhes
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum fornecedor encontrado com os filtros selecionados.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStateFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
