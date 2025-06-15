
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface SecurityErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SecurityErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  SecurityErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SecurityErrorBoundaryState {
    console.error('🚨 Security component error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Security Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="shadow border-destructive/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Erro no Componente de Segurança</CardTitle>
            </div>
            <CardDescription>
              Ocorreu um erro ao carregar este componente de segurança.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Detalhes do erro:</p>
              <code className="text-xs text-destructive">
                {this.state.error?.message || 'Erro desconhecido'}
              </code>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                <Shield className="mr-2 h-4 w-4" />
                Recarregar Página
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Se o problema persistir, verifique se você possui permissões de administrador 
              e se está logado corretamente no sistema.
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
