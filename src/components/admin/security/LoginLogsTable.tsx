
import React, { useState, useEffect } from 'react';
import { getLoginLogs, LoginLog, exportLoginLogsToCSV } from '@/services/securityService';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const LoginLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<{
    userEmail: string;
    ipAddress: string;
    success: string;
    startDate: string;
    endDate: string;
  }>({
    userEmail: '',
    ipAddress: '',
    success: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const formattedFilters = {
        userEmail: filters.userEmail,
        ipAddress: filters.ipAddress,
        success: filters.success === '' ? undefined : filters.success === 'true',
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      
      const { data, count } = await getLoginLogs(currentPage, pageSize, formattedFilters);
      setLogs(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching login logs:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar os logs de acesso.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const formattedFilters = {
        userEmail: filters.userEmail,
        ipAddress: filters.ipAddress,
        success: filters.success === '' ? undefined : filters.success === 'true',
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      
      const csv = await exportLoginLogsToCSV(formattedFilters);
      if (!csv) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não há dados para exportar.",
        });
        return;
      }
      
      // Create a blob and download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `login-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Sucesso",
        description: "Logs exportados com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao exportar os logs.",
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      userEmail: '',
      ipAddress: '',
      success: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, pageSize]);

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Logs de Acesso</CardTitle>
            <CardDescription>
              Registro de todas as tentativas de login
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <form onSubmit={handleFilterSubmit} className="space-y-4 mb-6 p-4 border rounded-md bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="userEmail">Email do Usuário</Label>
                <div className="flex mt-1">
                  <Input
                    id="userEmail"
                    placeholder="Buscar por email"
                    value={filters.userEmail}
                    onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="ipAddress">Endereço IP</Label>
                <div className="flex mt-1">
                  <Input
                    id="ipAddress"
                    placeholder="Buscar por IP"
                    value={filters.ipAddress}
                    onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="success">Status</Label>
                <Select 
                  value={filters.success} 
                  onValueChange={(value) => handleFilterChange('success', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="true">Bem-sucedidos</SelectItem>
                    <SelectItem value="false">Falhas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={resetFilters}>
                Limpar Filtros
              </Button>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log de acesso encontrado
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead><Globe className="h-4 w-4" /> IP</TableHead>
                  <TableHead><Clock className="h-4 w-4" /> Data/Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.success ? (
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 text-sm">Sucesso</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600 text-sm">Falha</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{log.user_email || 'N/A'}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                    <TableCell>
                      {format(new Date(log.attempted_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm">
                      Página {currentPage} de {Math.ceil(totalCount / pageSize)}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
                      className={cn(currentPage >= Math.ceil(totalCount / pageSize) ? "pointer-events-none opacity-50" : "cursor-pointer")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
