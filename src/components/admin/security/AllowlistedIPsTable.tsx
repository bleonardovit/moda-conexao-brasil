
import React, { useState, useEffect } from 'react';
import { getAllowlistedIPs, addAllowlistedIP, removeAllowlistedIP, updateAllowlistedIP, isValidIPCidr } from '@/services/allowlistService';
import { AllowlistedIP } from '@/types/security';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const AllowlistedIPsTable: React.FC = () => {
  const [allowlistedIPs, setAllowlistedIPs] = useState<AllowlistedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newIPForm, setNewIPForm] = useState({ ipAddressOrCidr: '', description: '' });
  const { toast } = useToast();

  const fetchAllowlistedIPs = async () => {
    try {
      const data = await getAllowlistedIPs();
      setAllowlistedIPs(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar IPs permitidos." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowlistedIPs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllowlistedIPs();
    setRefreshing(false);
  };

  const handleAddIP = async () => {
    if (!isValidIPCidr(newIPForm.ipAddressOrCidr)) {
      toast({ variant: "destructive", title: "Entrada Inválida", description: "Por favor, insira um endereço IP ou um intervalo CIDR válido." });
      return;
    }

    const { error } = await addAllowlistedIP(newIPForm.ipAddressOrCidr, newIPForm.description);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message || "Falha ao adicionar IP." });
    } else {
      toast({ title: "Sucesso", description: "IP adicionado à lista de permissões." });
      setOpenAddDialog(false);
      setNewIPForm({ ipAddressOrCidr: '', description: '' });
      fetchAllowlistedIPs();
    }
  };

  const handleToggleActive = async (ip: AllowlistedIP) => {
    const { error } = await updateAllowlistedIP(ip.id, { is_active: !ip.is_active });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar o status do IP." });
    } else {
      toast({ title: "Sucesso", description: "Status do IP atualizado." });
      fetchAllowlistedIPs();
    }
  };

  const handleRemoveIP = async (id: string) => {
    const { error } = await removeAllowlistedIP(id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao remover o IP." });
    } else {
      toast({ title: "Sucesso", description: "IP removido da lista de permissões." });
      fetchAllowlistedIPs();
    }
  };

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>IPs Permitidos (Allowlist)</CardTitle>
            <CardDescription>IPs isentos de bloqueios de segurança. Tenha cuidado ao editar.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Adicionar IP</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar IP à Lista de Permissões</DialogTitle>
                  <DialogDescription>Insira um IP ou um intervalo CIDR (ex: 192.168.1.0/24).</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ipAddressOrCidr">IP ou CIDR</Label>
                    <Input id="ipAddressOrCidr" placeholder="Ex: 200.200.200.200" value={newIPForm.ipAddressOrCidr} onChange={(e) => setNewIPForm({ ...newIPForm, ipAddressOrCidr: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input id="description" placeholder="Ex: Escritório principal" value={newIPForm.description} onChange={(e) => setNewIPForm({ ...newIPForm, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddIP}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Atualizar</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : allowlistedIPs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum IP na lista de permissões.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><ShieldCheck className="h-4 w-4" /> IP / CIDR</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Adicionado por</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowlistedIPs.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-mono">{ip.ip_address_or_cidr}</TableCell>
                  <TableCell>{ip.description || 'N/A'}</TableCell>
                  <TableCell>{ip.created_by_email || 'Sistema'}</TableCell>
                  <TableCell>{format(new Date(ip.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                  <TableCell><Switch checked={ip.is_active} onCheckedChange={() => handleToggleActive(ip)} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveIP(ip.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
