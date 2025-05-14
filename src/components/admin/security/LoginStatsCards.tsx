
import React, { useState, useEffect } from 'react';
import { getLoginStats } from '@/services/securityService';
import { LoginStats } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, XCircle, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginStatsCards: React.FC = () => {
  const [stats, setStats] = useState<LoginStats>({
    totalLogins: 0,
    successfulLogins: 0,
    failedLogins: 0,
    uniqueIPs: 0,
    blockedIPs: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getLoginStats(7); // Last 7 days
      setStats(data);
    } catch (error) {
      console.error('Error fetching login stats:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar as estatísticas de login.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Logins</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Últimos 7 dias</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-green-600">Logins Bem-Sucedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              {stats.successfulLogins}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalLogins > 0 
              ? `${Math.round((stats.successfulLogins / stats.totalLogins) * 100)}% do total`
              : '0% do total'
            }
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-red-600">Tentativas Falhas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              {stats.failedLogins}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalLogins > 0 
              ? `${Math.round((stats.failedLogins / stats.totalLogins) * 100)}% do total`
              : '0% do total'
            }
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">IPs Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold flex items-center">
              <Globe className="h-5 w-5 text-blue-500 mr-2" />
              {stats.uniqueIPs}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Endereços IP diferentes</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">IPs Bloqueados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold flex items-center">
              <Shield className="h-5 w-5 text-amber-500 mr-2" />
              {stats.blockedIPs}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Atualizados agora</p>
        </CardContent>
      </Card>
      
      <div className="col-span-1 sm:col-span-2 lg:col-span-5 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Estatísticas
        </Button>
      </div>
    </div>
  );
};
