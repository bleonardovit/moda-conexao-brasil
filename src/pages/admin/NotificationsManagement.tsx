
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  Plus, 
  Trash, 
  Pencil, 
  Check, 
  X, 
  Users,
  UserCog,
  UserCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { 
  getAllNotifications, 
  createNotification,
  updateNotification,
  deleteNotification 
} from '@/services/notificationService';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Notification } from '@/types/notification';

// Schema para validação do formulário
const notificationSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  target_roles: z.array(z.enum(['user', 'admin'])).min(1, 'Selecione pelo menos um perfil'),
  target_subscription_types: z.array(z.enum(['monthly', 'yearly'])).optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationsManagement() {
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  const queryClient = useQueryClient();
  
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      message: '',
      target_roles: ['user'],
      target_subscription_types: [],
    },
  });
  
  // Buscar todas as notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: getAllNotifications,
  });
  
  // Criar nova notificação
  const createMutation = useMutation({
    mutationFn: (values: NotificationFormValues) => createNotification({
      title: values.title,
      message: values.message,
      target_roles: values.target_roles,
      target_subscription_types: values.target_subscription_types,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsNewDialogOpen(false);
      form.reset();
      toast.success('Notificação criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar notificação');
    },
  });
  
  // Atualizar notificação
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Notification> }) => 
      updateNotification(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsEditDialogOpen(false);
      toast.success('Notificação atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar notificação');
    },
  });
  
  // Excluir notificação
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      toast.success('Notificação excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir notificação');
    },
  });
  
  // Formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", {
      locale: ptBR,
    });
  };
  
  // Manipuladores
  const handleOpenNewDialog = () => {
    form.reset();
    setIsNewDialogOpen(true);
  };
  
  const handleOpenEditDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    form.reset({
      title: notification.title,
      message: notification.message,
      target_roles: notification.target_roles || ['user'],
      target_subscription_types: notification.target_subscription_types || [],
    });
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };
  
  const onSubmitNew = (values: NotificationFormValues) => {
    createMutation.mutate(values);
  };
  
  const onSubmitEdit = (values: NotificationFormValues) => {
    if (selectedNotification) {
      updateMutation.mutate({
        id: selectedNotification.id,
        data: values,
      });
    }
  };
  
  const handleDelete = () => {
    if (selectedNotification) {
      deleteMutation.mutate(selectedNotification.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Notificações</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie notificações para os usuários.
            </p>
          </div>
          <Button 
            className="flex items-center gap-2" 
            onClick={handleOpenNewDialog}
          >
            <Plus className="h-4 w-4" />
            Nova Notificação
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Destinatários</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-center py-4">Carregando...</div>
                  </TableCell>
                </TableRow>
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-center py-4">Nenhuma notificação encontrada</div>
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="font-medium">{notification.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {notification.target_roles?.includes('admin') && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <UserCog className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {notification.target_roles?.includes('user') && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            <Users className="h-3 w-3 mr-1" />
                            Usuários
                          </Badge>
                        )}
                        {notification.target_subscription_types?.includes('monthly') && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Mensal
                          </Badge>
                        )}
                        {notification.target_subscription_types?.includes('yearly') && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Anual
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(notification.created_at)}
                    </TableCell>
                    <TableCell>
                      {notification.views_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenEditDialog(notification)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(notification)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Dialog para criar nova notificação */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Notificação</DialogTitle>
            <DialogDescription>
              Crie uma nova notificação para enviar aos usuários da plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNew)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Novos fornecedores disponíveis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Digite a mensagem da notificação..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="target_roles"
                render={() => (
                  <FormItem>
                    <FormLabel>Destinatários</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="user-role"
                          checked={form.watch('target_roles').includes('user')}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.watch('target_roles');
                            if (checked) {
                              form.setValue('target_roles', [...currentRoles, 'user']);
                            } else {
                              form.setValue('target_roles', currentRoles.filter(role => role !== 'user'));
                            }
                          }}
                        />
                        <label
                          htmlFor="user-role"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Usuários
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="admin-role"
                          checked={form.watch('target_roles').includes('admin')}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.watch('target_roles');
                            if (checked) {
                              form.setValue('target_roles', [...currentRoles, 'admin']);
                            } else {
                              form.setValue('target_roles', currentRoles.filter(role => role !== 'admin'));
                            }
                          }}
                        />
                        <label
                          htmlFor="admin-role"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Administradores
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="target_subscription_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Tipos de Assinatura</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="monthly"
                          checked={form.watch('target_subscription_types')?.includes('monthly')}
                          onCheckedChange={(checked) => {
                            const currentTypes = form.watch('target_subscription_types') || [];
                            if (checked) {
                              form.setValue('target_subscription_types', [...currentTypes, 'monthly']);
                            } else {
                              form.setValue('target_subscription_types', currentTypes.filter(type => type !== 'monthly'));
                            }
                          }}
                        />
                        <label
                          htmlFor="monthly"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Assinantes Mensais
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="yearly"
                          checked={form.watch('target_subscription_types')?.includes('yearly')}
                          onCheckedChange={(checked) => {
                            const currentTypes = form.watch('target_subscription_types') || [];
                            if (checked) {
                              form.setValue('target_subscription_types', [...currentTypes, 'yearly']);
                            } else {
                              form.setValue('target_subscription_types', currentTypes.filter(type => type !== 'yearly'));
                            }
                          }}
                        />
                        <label
                          htmlFor="yearly"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Assinantes Anuais
                        </label>
                      </div>
                    </div>
                    <FormDescription>
                      Deixe em branco para enviar a todos os usuários independente do plano.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para editar notificação */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Notificação</DialogTitle>
            <DialogDescription>
              Atualize as informações da notificação selecionada.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="target_roles"
                render={() => (
                  <FormItem>
                    <FormLabel>Destinatários</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-user-role"
                          checked={form.watch('target_roles').includes('user')}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.watch('target_roles');
                            if (checked) {
                              form.setValue('target_roles', [...currentRoles, 'user']);
                            } else {
                              form.setValue('target_roles', currentRoles.filter(role => role !== 'user'));
                            }
                          }}
                        />
                        <label
                          htmlFor="edit-user-role"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Usuários
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-admin-role"
                          checked={form.watch('target_roles').includes('admin')}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.watch('target_roles');
                            if (checked) {
                              form.setValue('target_roles', [...currentRoles, 'admin']);
                            } else {
                              form.setValue('target_roles', currentRoles.filter(role => role !== 'admin'));
                            }
                          }}
                        />
                        <label
                          htmlFor="edit-admin-role"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Administradores
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="target_subscription_types"
                render={() => (
                  <FormItem>
                    <FormLabel>Tipos de Assinatura</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-monthly"
                          checked={form.watch('target_subscription_types')?.includes('monthly')}
                          onCheckedChange={(checked) => {
                            const currentTypes = form.watch('target_subscription_types') || [];
                            if (checked) {
                              form.setValue('target_subscription_types', [...currentTypes, 'monthly']);
                            } else {
                              form.setValue('target_subscription_types', currentTypes.filter(type => type !== 'monthly'));
                            }
                          }}
                        />
                        <label
                          htmlFor="edit-monthly"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Assinantes Mensais
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="edit-yearly"
                          checked={form.watch('target_subscription_types')?.includes('yearly')}
                          onCheckedChange={(checked) => {
                            const currentTypes = form.watch('target_subscription_types') || [];
                            if (checked) {
                              form.setValue('target_subscription_types', [...currentTypes, 'yearly']);
                            } else {
                              form.setValue('target_subscription_types', currentTypes.filter(type => type !== 'yearly'));
                            }
                          }}
                        />
                        <label
                          htmlFor="edit-yearly"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Assinantes Anuais
                        </label>
                      </div>
                    </div>
                    <FormDescription>
                      Deixe em branco para enviar a todos os usuários independente do plano.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação para excluir */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Notificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notificação?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
