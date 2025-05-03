
import { useState } from 'react';
import { User } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [isChangeDialogOpen, setIsChangeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<"monthly" | "yearly">(user.subscription_type || "monthly");
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const handleChangePlan = () => {
    // Implementação da mudança de plano seria aqui
    toast.success(`Plano alterado para ${newPlan === 'monthly' ? 'Mensal' : 'Anual'}`);
    setIsChangeDialogOpen(false);
  };
  
  const handleCancelSubscription = () => {
    // Implementação do cancelamento de assinatura seria aqui
    toast.success("Assinatura cancelada com sucesso");
    setIsCancelDialogOpen(false);
  };
  
  const handlePlanSelection = (value: "monthly" | "yearly") => {
    setNewPlan(value);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sua Assinatura</CardTitle>
          <CardDescription>
            Gerencie sua assinatura e método de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Plano atual</h3>
              <p className="font-medium">{user.subscription_type === 'monthly' ? 'Mensal' : 'Anual'}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${user.subscription_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="font-medium">{user.subscription_status === 'active' ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Início da assinatura</h3>
              <p>{user.subscription_start_date ? formatDate(user.subscription_start_date) : 'N/A'}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Próxima cobrança</h3>
              <p>
                {user.subscription_start_date ? formatDate(new Date(new Date(user.subscription_start_date).setMonth(new Date(user.subscription_start_date).getMonth() + (user.subscription_type === 'monthly' ? 1 : 12))).toISOString()) : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
          <Button variant="outline" onClick={() => setIsChangeDialogOpen(true)}>
            Alterar plano
          </Button>
          <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)}>
            Cancelar assinatura
          </Button>
        </CardFooter>
      </Card>
      
      {/* Dialog para alterar plano */}
      <Dialog open={isChangeDialogOpen} onOpenChange={setIsChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar plano</DialogTitle>
            <DialogDescription>
              Escolha o novo plano para sua assinatura.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newPlan} onValueChange={handlePlanSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Plano Mensal - R$29,90/mês</SelectItem>
                <SelectItem value="yearly">Plano Anual - R$299,00/ano (15% de desconto)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePlan}>
              Confirmar mudança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para cancelar assinatura */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso a todos os recursos premium.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
