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
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  MoreHorizontal, 
  Download, 
  Mail, 
  Edit, 
  Trash, 
  CreditCard,
  Calendar,
  RefreshCcw,
  Save,
  User as UserIcon,
  Phone
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import type { User, Payment } from '@/types';

// Exemplo de dados mockados
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
    id: 'user4',
    email: 'patricia@example.com',
    full_name: 'Patricia Lima',
    phone: '(41) 99887-6655',
    subscription_status: 'pending',
    subscription_type: 'monthly',
    last_login: '2023-08-01T10:12:45Z',
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

// Dados de pagamentos de exemplo
const MOCK_PAYMENTS = [
  { id: 'pay1', user_id: 'user1', amount: 'R$ 29,90', date: '2023-07-10', status: 'success', method: 'card' },
  { id: 'pay2', user_id: 'user1', amount: 'R$ 29,90', date: '2023-06-10', status: 'success', method: 'card' },
  { id: 'pay3', user_id: 'user1', amount: 'R$ 29,90', date: '2023-05-10', status: 'success', method: 'card' },
  { id: 'pay4', user_id: 'user2', amount: 'R$ 299,00', date: '2023-04-15', status: 'success', method: 'pix' },
  { id: 'pay5', user_id: 'user3', amount: 'R$ 29,90', date: '2023-03-20', status: 'success', method: 'card' },
  { id: 'pay6', user_id: 'user3', amount: 'R$ 29,90', date: '2023-04-20', status: 'failed', method: 'card' },
];

// Interfaces para os formulários
interface EmailFormValues {
  subject: string;
  message: string;
}

interface UserFormValues {
  full_name: string;
  email: string;
  phone: string;
}

export default function UsersManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditSubscriptionOpen, setIsEditSubscriptionOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Novo estado para edição de assinatura
  const [subscriptionEditData, setSubscriptionEditData] = useState({
    type: '',
    status: ''
  });
  
  // Formulário para email
  const emailForm = useForm<EmailFormValues>({
    defaultValues: {
      subject: '',
      message: ''
    }
  });

  // Formulário para edição de usuário
  const userForm = useForm<UserFormValues>({
    defaultValues: {
      full_name: '',
      email: '',
      phone: ''
    }
  });
  
  // Filtrar usuários com base nos critérios de pesquisa
  const filteredUsers = MOCK_USERS.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Abrir detalhes do usuário
  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  // Abrir modal de edição de assinatura
  const openEditSubscription = () => {
    if (selectedUser) {
      setSubscriptionEditData({
        type: selectedUser.subscription_type || 'monthly',
        status: selectedUser.subscription_status
      });
      setIsEditSubscriptionOpen(true);
    }
  };

  // Abrir modal de envio de email
  const openEmailDialog = (user: User) => {
    setSelectedUser(user);
    emailForm.reset({
      subject: '',
      message: `Olá ${user.full_name},\n\n`
    });
    setIsEmailDialogOpen(true);
  };

  // Abrir modal de edição de usuário
  const openEditUserDialog = () => {
    if (selectedUser) {
      userForm.reset({
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        phone: selectedUser.phone || ''
      });
      setIsEditUserDialogOpen(true);
    }
  };

  // Salvar alterações na assinatura
  const saveSubscriptionChanges = () => {
    if (selectedUser) {
      // Simular uma atualização no backend
      const updatedUser = {
        ...selectedUser,
        subscription_status: subscriptionEditData.status as 'active' | 'inactive' | 'pending',
        subscription_type: subscriptionEditData.type as 'monthly' | 'yearly' | undefined
      };

      // Atualizar o usuário selecionado com os novos dados
      setSelectedUser(updatedUser);
      
      toast({
        title: "Assinatura atualizada",
        description: `Detalhes da assinatura de ${selectedUser.full_name} foram atualizados com sucesso.`,
      });

      setIsEditSubscriptionOpen(false);
    }
  };

  // Salvar alterações no usuário
  const saveUserChanges = (data: UserFormValues) => {
    if (selectedUser) {
      // Simular uma atualização no backend
      const updatedUser = {
        ...selectedUser,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone
      };

      // Atualizar o usuário selecionado com os novos dados
      setSelectedUser(updatedUser);
      
      toast({
        title: "Usuário atualizado",
        description: `Dados do usuário ${data.full_name} foram atualizados com sucesso.`,
      });

      setIsEditUserDialogOpen(false);
    }
  };

  // Enviar email
  const sendEmail = (data: EmailFormValues) => {
    if (selectedUser) {
      // Simular envio de email
      console.log('Enviando email:', {
        to: selectedUser.email,
        ...data
      });
      
      toast({
        title: "Email enviado",
        description: `Email enviado com sucesso para ${selectedUser.full_name}.`,
      });

      setIsEmailDialogOpen(false);
      emailForm.reset();
    }
  };

  // Confirmar desativação de usuário
  const confirmDeactivate = () => {
    setIsDeactivateDialogOpen(true);
  };

  // Desativar usuário
  const deactivateUser = () => {
    if (selectedUser) {
      // Aqui seria implementada a lógica para desativar no backend
      console.log('Desativando usuário:', selectedUser.id);

      toast({
        title: "Usuário desativado",
        description: `Conta de ${selectedUser.full_name} foi desativada com sucesso.`,
      });

      setIsDeactivateDialogOpen(false);
      setIsUserDetailsOpen(false);
    }
  };

  // Enviar email de pagamento
  const sendPaymentLink = (userId: string, userName: string) => {
    console.log('Enviando link de pagamento para:', userId);
    
    toast({
      title: "Link de pagamento enviado",
      description: `Um email com o link de pagamento foi enviado para ${userName}.`,
    });
  };
  
  // Exportar lista de usuários em formato CSV
  const exportCSV = () => {
    setIsExporting(true);
    
    try {
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
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_conexao_brasil_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório exportado",
        description: "O relatório de usuários foi exportado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar o relatório de usuários.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Obter histórico de pagamentos para o usuário selecionado
  const getUserPayments = (userId: string) => {
    return MOCK_PAYMENTS.filter(payment => payment.user_id === userId);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <Button onClick={exportCSV} disabled={isExporting}>
            {isExporting ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </>
            )}
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
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openUserDetails(user)}>
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
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                          <DropdownMenuItem onClick={() => openUserDetails(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Ver detalhes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEmailDialog(user)}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Enviar email</span>
                          </DropdownMenuItem>
                          {user.subscription_status !== 'active' && (
                            <DropdownMenuItem onClick={() => sendPaymentLink(user.id, user.full_name)}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              <span>Reenviar link de pagamento</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            confirmDeactivate();
                          }} className="text-red-600">
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

      {/* Modal de detalhes do usuário */}
      {selectedUser && (
        <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedUser.full_name}
                {selectedUser.role === 'admin' && (
                  <Badge className="bg-blue-500">Admin</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Detalhes do usuário e gerenciamento de assinatura
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="profile" className="mt-4">
              <TabsList>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="subscription">Assinatura</TabsTrigger>
                <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              </TabsList>

              {/* Aba de perfil */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{selectedUser.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                    <p>{selectedUser.phone || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Função</h3>
                    <p>{selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Último acesso</h3>
                    <p>
                      {selectedUser.last_login 
                        ? new Date(selectedUser.last_login).toLocaleString('pt-BR') 
                        : 'Não disponível'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={openEditUserDialog}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar dados
                  </Button>
                  <Button variant="destructive" onClick={confirmDeactivate}>
                    <Trash className="mr-2 h-4 w-4" />
                    Desativar usuário
                  </Button>
                </div>
              </TabsContent>

              {/* Aba de assinatura */}
              <TabsContent value="subscription" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes da Assinatura</CardTitle>
                    <CardDescription>Detalhes e status da assinatura atual</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <Badge className={`${
                          selectedUser.subscription_status === 'active' 
                            ? 'bg-green-500' 
                            : selectedUser.subscription_status === 'pending'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}>
                          {selectedUser.subscription_status === 'active' 
                            ? 'Ativo' 
                            : selectedUser.subscription_status === 'pending'
                              ? 'Pendente'
                              : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Plano</h3>
                        <p>
                          {selectedUser.subscription_type 
                            ? (selectedUser.subscription_type === 'monthly' ? 'Mensal (R$ 29,90/mês)' : 'Anual (R$ 299,00/ano)')
                            : 'Não definido'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Data de início</h3>
                        <p>{selectedUser.subscription_start_date ? formatDate(selectedUser.subscription_start_date) : 'N/A'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Próxima renovação</h3>
                        <p>
                          {selectedUser.subscription_start_date && selectedUser.subscription_status === 'active'
                            ? (selectedUser.subscription_type === 'monthly' 
                                ? formatDate(new Date(new Date(selectedUser.subscription_start_date).setMonth(new Date(selectedUser.subscription_start_date).getMonth() + 1)).toISOString())
                                : formatDate(new Date(new Date(selectedUser.subscription_start_date).setFullYear(new Date(selectedUser.subscription_start_date).getFullYear() + 1)).toISOString())
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={openEditSubscription}>Alterar assinatura</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Aba de pagamentos */}
              <TabsContent value="payments" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
                    <CardDescription>Registro de pagamentos e renovações</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getUserPayments(selectedUser.id).length > 0 ? (
                          getUserPayments(selectedUser.id).map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.date}</TableCell>
                              <TableCell>{payment.amount}</TableCell>
                              <TableCell>
                                {payment.method === 'card' ? 'Cartão de crédito' : 'PIX'}
                              </TableCell>
                              <TableCell>
                                <Badge className={payment.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                                  {payment.status === 'success' ? 'Sucesso' : 'Falha'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="h-16 text-center">
                              Nenhum pagamento encontrado.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  {selectedUser.subscription_status === 'pending' && (
                    <CardFooter className="flex justify-end">
                      <Button onClick={() => sendPaymentLink(selectedUser.id, selectedUser.full_name)}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Reenviar link de pagamento
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para editar assinatura */}
      <Dialog open={isEditSubscriptionOpen} onOpenChange={setIsEditSubscriptionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar assinatura</DialogTitle>
            <DialogDescription>
              Modificar o plano ou status da assinatura de {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Plano de assinatura</h3>
              <Select 
                value={subscriptionEditData.type} 
                onValueChange={(value) => setSubscriptionEditData({ ...subscriptionEditData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal (R$ 29,90/mês)</SelectItem>
                  <SelectItem value="yearly">Anual (R$ 299,00/ano)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Status</h3>
              <Select 
                value={subscriptionEditData.status} 
                onValueChange={(value) => setSubscriptionEditData({ ...subscriptionEditData, status: value as 'active' | 'inactive' | 'pending' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubscriptionOpen(false)}>Cancelar</Button>
            <Button onClick={saveSubscriptionChanges}>
              <Save className="mr-2 h-4 w-4" />
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar dados do usuário */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar dados do usuário</DialogTitle>
            <DialogDescription>
              Atualizar informações pessoais de {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(saveUserChanges)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pr-3">
                        <Input className="border-0 focus-visible:ring-0" {...field} />
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pr-3">
                        <Input className="border-0 focus-visible:ring-0" {...field} />
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pr-3">
                        <Input className="border-0 focus-visible:ring-0" {...field} />
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEditUserDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para enviar email */}
