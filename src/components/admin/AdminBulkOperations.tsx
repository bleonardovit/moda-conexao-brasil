
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { toggleSupplierFeatured, toggleSupplierVisibility } from '@/services/supplierService';
import { Eye, EyeOff, Star, StarOff, Trash2 } from 'lucide-react';
import type { Supplier } from '@/types';

interface AdminBulkOperationsProps {
  selectedSuppliers: Supplier[];
  onOperationComplete: () => void;
  onClearSelection: () => void;
}

export function AdminBulkOperations({
  selectedSuppliers,
  onOperationComplete,
  onClearSelection
}: AdminBulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const { toast } = useToast();

  const batchSize = 50; // Process in batches to avoid overwhelming the system

  const processBatch = async (
    items: Supplier[],
    operation: (id: string) => Promise<void>,
    operationName: string
  ) => {
    setIsProcessing(true);
    setCurrentOperation(operationName);
    setProgress(0);

    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    let completed = 0;
    
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (supplier) => {
          await operation(supplier.id);
          completed++;
          setProgress((completed / items.length) * 100);
        })
      );
      
      // Small delay between batches to prevent overwhelming the database
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsProcessing(false);
    setProgress(0);
    setCurrentOperation('');
    onOperationComplete();
    onClearSelection();
  };

  const handleBulkToggleVisibility = async (hide: boolean) => {
    const action = hide ? 'ocultar' : 'mostrar';
    
    toast({
      title: `Processando operação em massa`,
      description: `Iniciando processo para ${action} ${selectedSuppliers.length} fornecedores...`,
    });

    try {
      await processBatch(
        selectedSuppliers,
        (id) => toggleSupplierVisibility(id),
        `${action} fornecedores`
      );

      toast({
        title: "Operação concluída",
        description: `${selectedSuppliers.length} fornecedores foram ${hide ? 'ocultados' : 'mostrados'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na operação",
        description: "Alguns fornecedores podem não ter sido processados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBulkToggleFeatured = async (featured: boolean) => {
    const action = featured ? 'destacar' : 'remover destaque';
    
    toast({
      title: `Processando operação em massa`,
      description: `Iniciando processo para ${action} ${selectedSuppliers.length} fornecedores...`,
    });

    try {
      await processBatch(
        selectedSuppliers,
        (id) => toggleSupplierFeatured(id),
        `${action} fornecedores`
      );

      toast({
        title: "Operação concluída",
        description: `${selectedSuppliers.length} fornecedores foram ${featured ? 'destacados' : 'removidos do destaque'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro na operação",
        description: "Alguns fornecedores podem não ter sido processados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (selectedSuppliers.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedSuppliers.length} fornecedor{selectedSuppliers.length !== 1 ? 'es' : ''} selecionado{selectedSuppliers.length !== 1 ? 's' : ''}
          </span>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Limpar Seleção
          </Button>
        </div>
      </div>

      {isProcessing && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{currentOperation}...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkToggleVisibility(false)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Mostrar Todos
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkToggleVisibility(true)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <EyeOff className="h-4 w-4" />
          Ocultar Todos
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkToggleFeatured(true)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Destacar Todos
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkToggleFeatured(false)}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <StarOff className="h-4 w-4" />
          Remover Destaque
        </Button>
      </div>
    </div>
  );
}
