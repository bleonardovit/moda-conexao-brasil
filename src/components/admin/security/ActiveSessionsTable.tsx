
import React, { useState, useEffect } from 'react';
import { getActiveSessions, ActiveSession } from '@/services/securityService';
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
import { RefreshCw, User, Clock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const ActiveSessionsTable: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar as sessões ativas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSessions();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSessions();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>
              Usuários atualmente logados no sistema
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma sessão ativa encontrada
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="h-4 w-4" /> Usuário</TableHead>
                <TableHead><Globe className="h-4 w-4" /> Endereço IP</TableHead>
                <TableHead><Clock className="h-4 w-4" /> Login</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <div>{session.full_name}</div>
                    <div className="text-xs text-muted-foreground">{session.user_email}</div>
                  </TableCell>
                  <TableCell>{session.ip_address}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(session.login_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(session.last_active), {
                      addSuffix: true,
                      locale: ptBR
                    })}
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
