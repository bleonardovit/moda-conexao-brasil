
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
import { Search, MoreHorizontal, Download, Mail, Edit, Trash } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { User } from '@/types';

// Dados de exemplo
const MOCK_USERS: User[] = [
  {
    id: 'user1',
    email: 'maria@example.com',
    full_name: 'Maria Silva',
    phone: '(11) 98765-4321',
    subscription_status: 'active',
    subscription_type: 'monthly',
    subscription_start_date: '2023-05-10',
    last_login: '2023-08-02T14:22:10Z',
    role: 'user'
  },
  {
    id: 'user2',
    email: 'joana@example.com',
    full_name: 'Joana Oliveira',
    phone: '(21) 99876-5432',
    subscription_status: 'active',
    subscription_type: 'yearly',
    subscription_start_date: '2023-04-15',
    last_login: '2023-08-03T09:11:24Z',
    role: 'user'
  },
  {
    id: 'user3',
    email: 'carlos@example.com',
    full_name: 'Carlos Santos',
    phone: '(31) 97654-3210',
    subscription_status: 'inactive',
    subscription_type: 'monthly',
    subscription_start_date: '2023-03-20',
    last_login: '2023-07-15T18:05:47Z',
    role: 'user'
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    full_name: 'Administrador',
    subscription_status: 'active',
    role: 'admin'
  }
];

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  
  // Filtrar usuários com base nos critérios de pesquisa
  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || 
      user.subscription_status === statusFilter;
    
    const matchesSubscription = subscriptionFilter === 'all' || 
      user.subscription_type === subscriptionFilter;
    
    return matchesSearch && matchesStatus && matchesSubscription;
  });
  
  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  // Exportar lista de usuários em formato CSV
  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Plano', 'Data de Cadastro'];
    const rows = filteredUsers.map(user => [
      user.full_name,
      user.email,
      user.phone || '',
      user.subscription_status,
      user.subscription_type || '',
      user.subscription_start_date ? formatDate(user.subscription_start_date) : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'usuarios_conexao_brasil.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={subscriptionFilter} 
            onValueChange={setSubscriptionFilter}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Tabela de usuários */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Plano</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name}
                      {user.role === 'admin' && (
                        <Badge className="ml-2 bg-blue-500">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={`${
                        user.subscription_status === 'active' 
                          ? 'bg-green-500' 
                          : user.subscription_status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}>
                        {user.subscription_status === 'active' 
                          ? 'Ativo' 
                          : user.subscription_status === 'pending'
                            ? 'Pendente'
                            : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.subscription_type 
                        ? (user.subscription_type === 'monthly' ? 'Mensal' : 'Anual')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.subscription_start_date 
                        ? formatDate(user.subscription_start_date)
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString('pt-BR')
                        : 'N/A'}
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar dados</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Enviar email</span>
                          </DropdownMenuItem>
                          {user.subscription_status !== 'active' && (
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Reenviar link de pagamento</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Desativar usuário</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
