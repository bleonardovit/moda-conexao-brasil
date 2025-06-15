
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ReportsErrorBoundaryProps {
  children: React.ReactNode;
}

interface ReportsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ReportsErrorBoundary extends React.Component<
  ReportsErrorBoundaryProps,
  ReportsErrorBoundaryState
> {
  constructor(props: ReportsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ReportsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Reports Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // Force a re-render by refreshing the page component
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-lg">Erro ao Carregar Relatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Ocorreu um erro ao carregar os dados dos relatórios. 
                  Isso pode ser devido a problemas de conectividade ou dados inválidos.
                </p>
                {this.state.error && (
                  <details className="text-xs text-muted-foreground bg-muted p-2 rounded mb-4">
                    <summary className="cursor-pointer font-medium">Detalhes do erro</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
