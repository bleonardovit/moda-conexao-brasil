
import React, { useState, useEffect } from 'react';
import { getDailyLoginStats, DailyLoginStat } from '@/services/securityService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LoginActivityChart: React.FC = () => {
  const [stats, setStats] = useState<DailyLoginStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getDailyLoginStats(7); // Last 7 days
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

  // Format date for chart
  const formatData = (data: DailyLoginStat[]) => {
    return data.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      })
    }));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Atividade de Login</CardTitle>
            <CardDescription>
              Visualização das tentativas de login dos últimos 7 dias
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
        ) : stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de login disponível
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatData(stats)}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name="Total" dataKey="total" fill="#8884d8" />
                <Bar name="Sucesso" dataKey="successful" fill="#82ca9d" />
                <Bar name="Falha" dataKey="failed" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
