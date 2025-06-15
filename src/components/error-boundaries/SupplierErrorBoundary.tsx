
import React, { Component, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SupplierErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface SupplierErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class SupplierErrorBoundary extends Component<SupplierErrorBoundaryProps, SupplierErrorBoundaryState> {
  constructor(props: SupplierErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SupplierErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Supplier Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
            <h3 className="font-medium mb-2">Erro ao carregar fornecedor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não foi possível carregar este fornecedor. Tente novamente.
            </p>
            <Button onClick={this.handleRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
