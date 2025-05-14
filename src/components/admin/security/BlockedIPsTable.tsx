
import React, { useState, useEffect } from 'react';
import { getBlockedIPs, blockIP, unblockIP } from '@/services/securityService';
import { BlockedIP } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Shield, Plus, X, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const BlockedIPsTable: React.FC = () => {
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedIP, setSelectedIP] = useState<BlockedIP | null>(null);
  const [newIPForm, setNewIPForm] = useState({
    ipAddress: '',
    reason: '',
    duration: 30
  });
  const { toast } = useToast();

  const fetchBlockedIPs = async () => {
    setLoading(true);
    try {
      const data = await getBlockedIPs();
      setBlockedIPs(data);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar os IPs bloqueados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBlockedIPs();
    setRefreshing(false);
  };

  const handleAddIP = async () => {
    try {
      if (!newIPForm.ipAddress) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "O endereço IP é obrigatório.",
        });
        return;
      }
      
      const success = await blockIP(
        newIPForm.ipAddress,
        newIPForm.reason,
        newIPForm.duration
      );
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "IP bloqueado com sucesso.",
        });
        setOpenAddDialog(false);
        setNewIPForm({
          ipAddress: '',
          reason: '',
          duration: 30
        });
        fetchBlockedIPs();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao bloquear o IP.",
        });
      }
    } catch (error) {
      console.error('Error blocking IP:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao bloquear o IP.",
      });
    }
  };

  const handleUnblockIP = async () => {
    try {
      if (!selectedIP) return;
      
      const success = await unblockIP(selectedIP.id);
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "IP desbloqueado com sucesso.",
        });
        setOpenRemoveDialog(false);
        setSelectedIP(null);
        fetchBlockedIPs();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao desbloquear o IP.",
        });
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao desbloquear o IP.",
      });
    }
  };

  const isIPActive = (blockedUntil: string): boolean => {
    return isAfter(new Date(blockedUntil), new Date());
  };

  useEffect(() => {
    fetchBlockedIPs();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBlockedIPs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>IPs Bloqueados</CardTitle>
            <CardDescription>
              Endereços IP bloqueados temporariamente
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Bloquear IP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bloquear Novo IP</DialogTitle>
                  <DialogDescription>
                    Adicione um endereço IP para bloquear temporariamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddress">Endereço IP</Label>
                    <Input
                      id="ipAddress"
                      placeholder="Ex: 192.168.1.1"
                      value={newIPForm.ipAddress}
                      onChange={(e) => setNewIPForm({...newIPForm, ipAddress: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo</Label>
                    <Input
                      id="reason"
                      placeholder="Motivo do bloqueio"
                      value={newIPForm.reason}
                      onChange={(e) => setNewIPForm({...newIPForm, reason: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (minutos)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={newIPForm.duration}
                      onChange={(e) => setNewIPForm({...newIPForm, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddIP}>Bloquear</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : blockedIPs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum IP bloqueado no momento
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Shield className="h-4 w-4" /> Endereço IP</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Bloqueado em</TableHead>
                <TableHead>Bloqueado até</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedIPs.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-medium">{ip.ip_address}</TableCell>
                  <TableCell>{ip.reason || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(ip.blocked_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(ip.blocked_until), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell>
                    {isIPActive(ip.blocked_until) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Expirado
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={openRemoveDialog} onOpenChange={setOpenRemoveDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setSelectedIP(ip)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {selectedIP && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Desbloquear IP</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja desbloquear o IP {selectedIP.ip_address}?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenRemoveDialog(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleUnblockIP}>Desbloquear</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
