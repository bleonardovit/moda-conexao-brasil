
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ActiveSessionsTable } from '@/components/admin/security/ActiveSessionsTable';
import { LoginLogsTable } from '@/components/admin/security/LoginLogsTable';
import { BlockedIPsTable } from '@/components/admin/security/BlockedIPsTable';
import { AllowlistedIPsTable } from '@/components/admin/security/AllowlistedIPsTable';
import { SecuritySettings } from '@/components/admin/security/SecuritySettings';
import { LoginStatsCards } from '@/components/admin/security/LoginStatsCards';
import { LoginActivityChart } from '@/components/admin/security/LoginActivityChart';
import { SecurityErrorBoundary } from '@/components/error-boundaries/SecurityErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function SecurityMonitoring() {
  return (
    <AdminLayout>
      <Helmet>
        <title>Monitoramento de Segurança | Conexão Brasil Admin</title>
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Monitoramento de Segurança</h1>
      </div>
      
      <SecurityErrorBoundary>
        <div className="mb-6">
          <LoginStatsCards />
        </div>
      </SecurityErrorBoundary>
      
      <SecurityErrorBoundary>
        <div className="mb-6">
          <LoginActivityChart />
        </div>
      </SecurityErrorBoundary>
      
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="blocked">IPs Bloqueados</TabsTrigger>
          <TabsTrigger value="allowlist">IPs Permitidos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
          <SecurityErrorBoundary>
            <ActiveSessionsTable />
          </SecurityErrorBoundary>
        </TabsContent>
        
        <TabsContent value="logs">
          <SecurityErrorBoundary>
            <LoginLogsTable />
          </SecurityErrorBoundary>
        </TabsContent>
        
        <TabsContent value="blocked">
          <SecurityErrorBoundary>
            <BlockedIPsTable />
          </SecurityErrorBoundary>
        </TabsContent>
        
        <TabsContent value="allowlist">
          <SecurityErrorBoundary>
            <AllowlistedIPsTable />
          </SecurityErrorBoundary>
        </TabsContent>

        <TabsContent value="settings">
          <SecurityErrorBoundary>
            <SecuritySettings />
          </SecurityErrorBoundary>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
