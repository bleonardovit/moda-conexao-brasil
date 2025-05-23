import { useState, useEffect } from 'react';
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
  Phone,
  MapPin
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
import { 
  getAllUsers, 
  getUserPayments,
  updateUser, 
  updateSubscription, 
  deactivateUser as serviceDeactivateUser
} from '@/services/userService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
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
  
  // Estado para pagamentos do usuário e carregamento
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  
  // Novo estado para edição de assinatura
  const [subscriptionEditData, setSubscriptionEditData] = useState({
    type: '' as User['subscription_type'], 
    status: '' as User['subscription_status'] 
  });
  
  // Buscar dados de usuários do Supabase
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  useEffect(() => {
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível buscar a lista de usuários.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
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
  const filteredUsers = users.filter(user => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (user.full_name || '').toLowerCase().includes(normalizedSearchTerm) ||
      (user.email || '').toLowerCase().includes(normalizedSearchTerm) ||
      (user.phone || '').toLowerCase().includes(normalizedSearchTerm) ||
      (user.city || '').toLowerCase().includes(normalizedSearchTerm) ||
      (user.state || '').toLowerCase().includes(normalizedSearchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
      (user.subscription_status || 'inactive') === statusFilter;
    
    const matchesSubscription = subscriptionFilter === 'all' || 
      (user.subscription_type || 'none') === subscriptionFilter; 
    
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
        status: selectedUser.subscription_status || 'inactive'
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
        full_name: selectedUser.full_name || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || ''
      });
      setIsEditUserDialogOpen(true);
    }
  };

  // Mutation for updating subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: (variables: { userId: string; type: User['subscription_type']; status: User['subscription_status'] }) => 
      updateSubscription(variables.userId, variables.type!, variables.status!),
    onSuccess: (_, variables) => {
      toast({
        title: "Assinatura atualizada",
        description: `Detalhes da assinatura de ${selectedUser?.full_name} foram atualizados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate users query
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] }); // Invalidate specific user query if exists
      
      // Update selectedUser state locally for immediate UI feedback
      if (selectedUser && selectedUser.id === variables.userId) {
        setSelectedUser(prev => prev ? {
          ...prev,
          subscription_type: variables.type,
          subscription_status: variables.status,
        } : null);
      }
      setIsEditSubscriptionOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao salvar alterações na assinatura:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar assinatura",
        description: "Ocorreu um erro ao salvar as alterações na assinatura.",
      });
    },
  });

  const saveSubscriptionChanges = async () => {
    if (selectedUser && subscriptionEditData.type && subscriptionEditData.status) {
      updateSubscriptionMutation.mutate({
        userId: selectedUser.id,
        type: subscriptionEditData.type,
        status: subscriptionEditData.status
      });
    }
  };

  // Mutation for updating user details
  const updateUserMutation = useMutation({
    mutationFn: (variables: { userId: string; data: UserFormValues }) => 
      updateUser(variables.userId, variables.data),
    onSuccess: (updatedUserData, variables) => {
      toast({
        title: "Usuário atualizado",
        description: `Dados do usuário ${variables.data.full_name} foram atualizados.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });

      if (selectedUser && selectedUser.id === variables.userId) {
        setSelectedUser(prev => prev ? ({ ...prev, ...variables.data }) : null);
      }
      setIsEditUserDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao salvar alterações no usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Ocorreu um erro ao salvar as alterações no usuário.",
      });
    },
  });

  const saveUserChanges = async (data: UserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, data });
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

  // Mutation for deactivating user
  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => serviceDeactivateUser(userId),
    onSuccess: (_, userId) => {
      toast({
        title: "Usuário desativado",
        description: `Conta de ${selectedUser?.full_name} foi desativada.`,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });

      if (selectedUser && selectedUser.id === userId) {
         setSelectedUser(prev => prev ? ({ ...prev, subscription_status: 'inactive' }) : null);
      }
      setIsDeactivateDialogOpen(false);
      setIsUserDetailsOpen(false); // Close details modal after deactivation
    },
    onError: (error) => {
      console.error("Erro ao desativar usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao desativar usuário",
        description: "Ocorreu um erro ao desativar o usuário.",
      });
    },
  });

  const deactivateUserHandler = async () => { // Renamed to avoid conflict
    if (selectedUser) {
      deactivateUserMutation.mutate(selectedUser.id);
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
      // Adicionado Estado ao CSV
      const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Status', 'Plano', 'Data de Cadastro'];
      const rows = filteredUsers.map(user => [
        user.full_name || '',
        user.email,
        user.phone || '',
        user.city || '', // Adicionado Cidade
        user.state || '', // Adicionado Estado
        user.subscription_status || '',
        user.subscription_type || '',
        user.created_at ? formatDate(user.created_at) : '' // Modificado para usar created_at
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

  // Obter histórico de pagamentos para o usuário selecionado quando o modal abrir ou o usuário mudar
  useEffect(() => {
    if (selectedUser && isUserDetailsOpen) {
      const fetchPayments = async () => {
        setIsLoadingPayments(true);
        try {
          // Make sure getUserPayments is correctly implemented in userService
          const paymentsData = await getUserPayments(selectedUser.id);
          setUserPayments(paymentsData);
        } catch (error) {
          console.error("Erro ao buscar pagamentos do usuário:", error);
          toast({
            title: "Erro ao buscar pagamentos",
            description: "Não foi possível carregar o histórico de pagamentos.",
            variant: "destructive",
          });
          setUserPayments([]);
        } finally {
          setIsLoadingPayments(false);
        }
      };
      fetchPayments();
    }
  }, [selectedUser, isUserDetailsOpen, toast]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <Button onClick={exportCSV} disabled={isExporting || updateUserMutation.isPending || updateSubscriptionMutation.isPending || deactivateUserMutation.isPending}>
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
              placeholder="Buscar por nome, email, cidade, estado..." // Atualizado placeholder
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
              {/* Add other statuses if applicable, e.g., 'trialing', 'canceled' */}
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
              <SelectItem value="none">Nenhum</SelectItem> 
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
                <TableHead className="hidden md:table-cell">Estado</TableHead> {/* Adicionada coluna Estado */}
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Plano</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openUserDetails(user)}>
                    <TableCell className="font-medium">
                      {user.full_name || 'N/A'}
                      {user.role === 'admin' && (
                        <Badge className="ml-2 bg-blue-500">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell"> {/* Adicionada célula para Estado */}
                      {user.state || 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={`${
                        user.subscription_status === 'active' 
                          ? 'bg-green-500' 
                          : user.subscription_status === 'pending'
                            ? 'bg-yellow-500'
                            : user.subscription_status === 'trialing'
                              ? 'bg-blue-400' 
                              : 'bg-red-500' 
                      }`}>
                        {user.subscription_status ? user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1) : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.subscription_type 
                        ? (user.subscription_type === 'monthly' ? 'Mensal' : 'Anual')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.created_at ? formatDate(user.created_at) : 'N/A'} 
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleString('pt-BR')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={updateUserMutation.isPending || updateSubscriptionMutation.isPending || deactivateUserMutation.isPending}>
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
                          {user.subscription_status !== 'active' && user.subscription_status !== 'trialing' && (
                            <DropdownMenuItem onClick={() => sendPaymentLink(user.id, user.full_name || user.email)}>
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
                  <TableCell colSpan={9} className="h-24 text-center">
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
                {selectedUser.full_name || 'Usuário sem nome'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center"><UserIcon size={14} className="mr-2 text-gray-500" />Nome Completo</h3>
                    <p className="ml-6">{selectedUser.full_name || 'Não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Mail size={14} className="mr-2 text-gray-500" />Email</h3>
                    <p className="ml-6">{selectedUser.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center"><Phone size={14} className="mr-2 text-gray-500" />Telefone</h3>
                    <p className="ml-6">{selectedUser.phone || 'Não informado'}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center"><MapPin size={14} className="mr-2 text-gray-500" />Cidade</h3>
                    <p className="ml-6">{selectedUser.city || 'Não informada'}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center"><MapPin size={14} className="mr-2 text-gray-500" />Estado</h3>
                    <p className="ml-6">{selectedUser.state || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Função</h3>
                    <p>{selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : 'Usuário'}</p>
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
                  <Button variant="outline" onClick={openEditUserDialog} disabled={updateUserMutation.isPending || deactivateUserMutation.isPending}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar dados
                  </Button>
                  <Button variant="destructive" onClick={confirmDeactivate} disabled={updateUserMutation.isPending || deactivateUserMutation.isPending}>
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
                              : selectedUser.subscription_status === 'trialing'
                                ? 'bg-blue-400'
                                : 'bg-red-500'
                        }`}>
                          {selectedUser.subscription_status ? selectedUser.subscription_status.charAt(0).toUpperCase() + selectedUser.subscription_status.slice(1) : 'Inativo'}
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
                        <h3 className="text-sm font-medium text-muted-foreground">Data de início da assinatura</h3>
                        <p>{selectedUser.subscription_start_date ? formatDate(selectedUser.subscription_start_date) : 'N/A'}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Próxima renovação</h3>
                        <p>
                          {selectedUser.subscription_start_date && (selectedUser.subscription_status === 'active' || selectedUser.subscription_status === 'trialing')
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
                    <Button onClick={openEditSubscription} disabled={updateSubscriptionMutation.isPending}>Alterar assinatura</Button>
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
                    {isLoadingPayments ? (
                      <p className="text-center text-muted-foreground py-4">Carregando pagamentos...</p>
                    ) : (
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
                          {userPayments.length > 0 ? (
                            userPayments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.date)}</TableCell>
                                <TableCell>R$ {payment.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                  {payment.method === 'card' ? 'Cartão de crédito' : 
                                   payment.method === 'pix' ? 'PIX' : 
                                   payment.method === 'bankslip' ? 'Boleto' :
                                   payment.method || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={payment.status === 'success' ? 'bg-green-500' : payment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}>
                                    {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A'}
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
                    )}
                  </CardContent>
                  {selectedUser && (selectedUser.subscription_status === 'pending' || selectedUser.subscription_status === 'inactive') && (
                    <CardFooter className="flex justify-end">
                      <Button onClick={() => sendPaymentLink(selectedUser.id, selectedUser.full_name || selectedUser.email)}>
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
              Modificar o plano ou status da assinatura de {selectedUser?.full_name || 'usuário'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Plano de assinatura</h3>
              <Select 
                value={subscriptionEditData.type || ''} 
                onValueChange={(value) => setSubscriptionEditData({ ...subscriptionEditData, type: value as User['subscription_type'] })}
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
                value={subscriptionEditData.status || ''} 
                onValueChange={(value) => setSubscriptionEditData({ ...subscriptionEditData, status: value as User['subscription_status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="trialing">Em Teste (Trial)</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubscriptionOpen(false)}  disabled={updateSubscriptionMutation.isPending}>Cancelar</Button>
            <Button onClick={saveSubscriptionChanges} disabled={updateSubscriptionMutation.isPending || !subscriptionEditData.type || !subscriptionEditData.status}>
              {updateSubscriptionMutation.isPending ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
              Atualizar informações pessoais de {selectedUser?.full_name || 'usuário'}
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(saveUserChanges)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="full_name"
                rules={{ required: "Nome completo é obrigatório" }}
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
                rules={{ required: "Email é obrigatório", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pr-3">
                        <Input type="email" className="border-0 focus-visible:ring-0" {...field} />
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
                <Button variant="outline" type="button" onClick={() => setIsEditUserDialogOpen(false)} disabled={updateUserMutation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para enviar email */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
            <DialogDescription>
              Envie um email para {selectedUser?.full_name || 'usuário'}
            </DialogDescription>
          </DialogHeader>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(sendEmail)} className="space-y-4">
               <FormField
                control={emailForm.control}
                name="subject"
                rules={{ required: "Assunto é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o assunto do email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={emailForm.control}
                name="message"
                rules={{ required: "Mensagem é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escreva a mensagem..." 
                        rows={5} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsEmailDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de confirmação de desativação */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar a conta de {selectedUser?.full_name || 'este usuário'}? Esta ação pode ser revertida posteriormente (reativando a assinatura ou status).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateUserMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deactivateUserHandler} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deactivateUserMutation.isPending}
            >
              {deactivateUserMutation.isPending ? <RefreshCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sim, desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
