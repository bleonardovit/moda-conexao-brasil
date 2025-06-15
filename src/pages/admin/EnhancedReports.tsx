
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, ShoppingBag, MessageSquare, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { getReportData, ReportData } from '@/services/enhancedReportService';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

export default function EnhancedReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setHasError(false);
      console.log('🔄 Fetching enhanced report data...');
      
      const reports = await getReportData();
      setReportData(reports);
      
      console.log('✅ Enhanced report data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading enhanced report data:', error);
      setHasError(true);
      toast({
        variant: "destructive",
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os dados dos relatórios.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (hasError || !reportData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle className="text-destructive">Erro ao Carregar Relatórios</CardTitle>
              <CardDescription>
                Não foi possível carregar os dados dos relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRefresh} className="w-full" disabled={refreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Relatórios | Conexão Brasil Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Relatórios do Sistema</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.activeUsers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalSuppliers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.activeSuppliers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Média: {reportData.averageRating} ⭐
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.loginStats.today}</div>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                Semana: {reportData.loginStats.thisWeek}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Mês: {reportData.loginStats.thisMonth}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Informações gerais sobre o desempenho da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">Sistema Operacional</div>
              <p className="text-sm text-muted-foreground">Todos os serviços funcionando</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {((reportData.activeSuppliers / Math.max(reportData.totalSuppliers, 1)) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Fornecedores ativos</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {(reportData.totalReviews / Math.max(reportData.totalUsers, 1)).toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">Avaliações por usuário</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
