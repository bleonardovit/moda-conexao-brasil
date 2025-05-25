import React, { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileArchive, 
  FileSpreadsheet, 
  Check, 
  X, 
  History, 
  Database,
  Import,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { SupplierImportHistory } from '@/types'; 
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { 
  SupplierRowData, 
  validateSupplierRow,
  importSuppliers, 
  processImagesFromZip, 
  saveImportHistory,
  ValidationErrors,
  ImportResult
} from '@/services/supplierBulkService';
import { useAuth } from '@/hooks/useAuth';

const TEMPLATE_HEADERS = [
  'codigo', 'nome', 'descricao', 'instagram', 'whatsapp', 'site', 
  'preco_medio', 
  'quantidade_minima', 
  'cidade', 'estado',
  'envio', 
  'precisa_cnpj', 
  'formas_pagamento', 
  'tipo_fornecedor', 
  'imagens' 
];

// Helper function to normalize strings consistently (can be moved to a utils file later)
const normalizeString = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function SuppliersBulkUpload() {
  console.log('[SuppliersBulkUpload Render] Component rendering/re-rendering.'); // Log Adicionado
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'history'>('upload');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [parsedSuppliers, setParsedSuppliers] = useState<SupplierRowData[]>([]);
  const [previewImages, setPreviewImages] = useState<Record<string, string[]>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<SupplierImportHistory[]>([]);
  
  const [existingCategories, setExistingCategories] = useState<Map<string, string>>(new Map());
  const [categoryNameToIdMap, setCategoryNameToIdMap] = useState<Map<string, string>>(new Map());
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set());
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    console.log('[useEffect InitialData] Componente montado. Buscando dados iniciais...');

    const fetchExistingData = async () => {
      try {
        console.log("[useEffect InitialData] Fetching existing categories and supplier codes...");
        
        // Buscar categorias primeiro
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');

        if (!isMounted) return;

        if (categoriesError) {
          console.error('[useEffect InitialData] Error fetching categories:', categoriesError);
          toast({ 
            variant: "destructive", 
            title: "Erro ao carregar categorias", 
            description: categoriesError.message 
          });
        } else {
          console.log('[useEffect InitialData] Categories data received:', categoriesData);
          
          const idToNameMap = new Map<string, string>();
          const nameToIdMap = new Map<string, string>();
          
          (categoriesData || []).forEach(cat => {
            if (cat.id && cat.name) {
              idToNameMap.set(cat.id, cat.name);
              nameToIdMap.set(normalizeString(cat.name), cat.id);
            }
          });
          
          if (isMounted) {
            setExistingCategories(idToNameMap);
            setCategoryNameToIdMap(nameToIdMap);
            console.log('[useEffect InitialData] Categories maps updated:', {
              idToNameMapSize: idToNameMap.size,
              nameToIdMapSize: nameToIdMap.size,
              categories: Array.from(idToNameMap.entries())
            });
          }
        }

        // Buscar códigos de fornecedores
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('code');

        if (!isMounted) return;

        if (suppliersError) {
          console.error('[useEffect InitialData] Error fetching supplier codes:', suppliersError);
          toast({ 
            variant: "destructive", 
            title: "Erro ao carregar códigos de fornecedores", 
            description: suppliersError.message 
          });
        } else {
          const codes = new Set((suppliersData || []).map(s => s.code));
          if (isMounted) {
            setExistingCodes(codes);
            console.log('[useEffect InitialData] Supplier codes loaded:', Array.from(codes));
          }
        }
      } catch (error) {
        console.error('[useEffect InitialData] Unexpected error:', error);
        toast({ 
          variant: "destructive", 
          title: "Erro inesperado", 
          description: error instanceof Error ? error.message : "Erro desconhecido" 
        });
      }
    };

    fetchExistingData();

    return () => {
      isMounted = false;
    };
  }, [toast]);
  
  const fetchHistoryLocal = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_import_history')
        .select('*')
        .order('imported_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching import history:', error);
        toast({ variant: "destructive", title: "Erro ao carregar histórico", description: error.message });
        return;
      }
      if (data) setImportHistory((data as SupplierImportHistory[] || []));
    } catch (error) {
      console.error('Error in fetchImportHistory:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado ao carregar histórico",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) fetchHistoryLocal();
    return () => { isMounted = false; };
  }, [toast]);
  
  const downloadTemplate = () => {
    const exampleData = [
      [
        'F001', 'Moda Fashion SP', 'Roupas femininas atacado', '@modafashionsp', '11999999999', 'https://modafashion.com',
        'medio', '10 peças', 'São Paulo', 'SP',
        'correios,transportadora', 'sim', 'pix,cartao', 
        'casual,fitness', 
        'F001-img1.jpg,F001-img2.png'
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ...exampleData
    ]);
    
    const columnWidths = TEMPLATE_HEADERS.map((_, i) => ({
        wch: Math.max(
            TEMPLATE_HEADERS[i].length, 
            ...exampleData.map(row => String(row[i] || "").length)
        ) + 2 
    }));
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fornecedores');
    XLSX.writeFile(workbook, 'template_fornecedores.xlsx');
    
    toast({
      title: "Template baixado",
      description: "Use este modelo para a importação."
    });
  };
  
  const exportValidationErrorsToCSV = (errors: ValidationErrors) => {
    if (!errors || Object.keys(errors).length === 0) return '';
    
    const header = 'Código,Erro';
    const lines = Object.entries(errors).flatMap(([code, msgs]) =>
      (Array.isArray(msgs) ? msgs : [String(msgs)]).map(msg => `${code},"${String(msg).replace(/"/g, '""')}"`)
    );
    
    return [header, ...lines].join('\n');
  };

  const downloadCSV = (csvContent: string, filename = 'erros_importacao.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
  };
  
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`[handleExcelUpload] Starting Excel file processing: ${file.name}`);
    setExcelFile(file); // Armazena o arquivo
    setIsProcessing(true); // Indica início do processamento
    // Reseta estados anteriores para um novo upload
    setParsedSuppliers([]);
    setValidationErrors({});
    setPreviewImages({});
    setProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonSuppliers = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 }); // Obter como array de arrays

      if (jsonSuppliers.length < 2) { // Pelo menos cabeçalho e uma linha de dados
        toast({ title: "Arquivo Excel vazio", description: "O arquivo parece não conter dados de fornecedores.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }
      
      const headers = (jsonSuppliers[0] as string[]).map(h => normalizeString(h));
      const missingHeaders = TEMPLATE_HEADERS.filter(th => !headers.includes(normalizeString(th)));

      if (missingHeaders.length > 0) {
        toast({
          title: "Cabeçalhos faltando no template",
          description: `Os seguintes cabeçalhos não foram encontrados: ${missingHeaders.join(', ')}`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const mappedSuppliers: SupplierRowData[] = jsonSuppliers.slice(1).map((rowArray: any[], rowIndex) => {
        const row: any = {};
        headers.forEach((header, index) => {
          // Encontra o nome original do header no template para usar como chave
          const templateHeaderKey = TEMPLATE_HEADERS.find(th => normalizeString(th) === header) || header;
          row[templateHeaderKey] = rowArray[index];
        });
        row.originalRowIndex = rowIndex + 2; // +1 para slice, +1 para 1-based index
        return row as SupplierRowData;
      });
      
      console.log(`[handleExcelUpload] Mapped suppliers data (count: ${mappedSuppliers.length})`);

      const currentValidationErrors: ValidationErrors = {};
      const suppliersToParse: SupplierRowData[] = [];

      mappedSuppliers.forEach(row => {
        const errors = validateSupplierRow(row, existingCodes, categoryNameToIdMap);
        if (errors.length > 0) {
          currentValidationErrors[row.codigo || `Linha ${row.originalRowIndex}`] = errors;
        }
        suppliersToParse.push(row); // Adiciona mesmo com erros para exibição
      });

      setParsedSuppliers(suppliersToParse);
      setValidationErrors(currentValidationErrors);
      
      console.log(`[handleExcelUpload] Validation complete. Errors count: ${Object.keys(currentValidationErrors).length}`);

      if (zipFile) {
        console.log('[handleExcelUpload] Processing ZIP file...');
        const zipData = await zipFile.arrayBuffer();
        const localImagePreviews: Record<string, string[]> = {};
        const JSZip = await import('jszip').then(mod => mod.default);
        const loadedZip = await JSZip.loadAsync(zipData);
        for (const supplier of suppliersToParse) {
          if (supplier.codigo && supplier.imagens) {
            const imageNames = supplier.imagens.split(',').map(name => name.trim());
            localImagePreviews[supplier.codigo] = [];
            for (const imageName of imageNames) {
              const imageFile = loadedZip.file(imageName);
              if (imageFile) {
                const blob = await imageFile.async('blob');
                localImagePreviews[supplier.codigo].push(URL.createObjectURL(blob));
              }
            }
          }
        }
        setPreviewImages(localImagePreviews);
        console.log('[handleExcelUpload] ZIP file processed.');
      }
      
      // A mudança de aba deve ocorrer após a definição dos estados
      // para que a aba de revisão já tenha os dados.
      setActiveTab('review'); 
      console.log('[handleExcelUpload] Moved to review tab.');

    } catch (error) {
      console.error('[handleExcelUpload] Error processing Excel:', error);
      toast({ title: "Erro ao processar Excel", description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.", variant: "destructive"});
      setParsedSuppliers([]);
      setValidationErrors({});
      setPreviewImages({});
    } finally {
      setIsProcessing(false); // Finaliza o processamento aqui
      console.log('[handleExcelUpload] Processing finished.');
      // Limpa o valor do input para permitir o re-upload do mesmo arquivo
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };
  
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setZipFile(file);
    console.log(`[handleZipUpload] ZIP file selected: ${file.name}`);

    // Se já houver fornecedores parseados, tentar processar as imagens imediatamente
    if (parsedSuppliers.length > 0) {
      setIsProcessing(true);
      console.log('[handleZipUpload] Reprocessing ZIP with existing parsed suppliers...');
      try {
        const zipData = await file.arrayBuffer();
        const localImagePreviews: Record<string, string[]> = {};
        const JSZip = await import('jszip').then(mod => mod.default);
        const loadedZip = await JSZip.loadAsync(zipData);
        for (const supplier of parsedSuppliers) {
          if (supplier.codigo && supplier.imagens) {
            const imageNames = supplier.imagens.split(',').map(name => name.trim());
            localImagePreviews[supplier.codigo] = [];
            for (const imageName of imageNames) {
              const imageFile = loadedZip.file(imageName);
              if (imageFile) {
                const blob = await imageFile.async('blob');
                localImagePreviews[supplier.codigo].push(URL.createObjectURL(blob));
              }
            }
          }
        }
        setPreviewImages(localImagePreviews);
        toast({ title: "Arquivo ZIP processado", description: "Imagens do ZIP foram vinculadas aos fornecedores." });
      } catch (error) {
        console.error('[handleZipUpload] Error processing ZIP file:', error);
        toast({ title: "Erro ao processar ZIP", description: error instanceof Error ? error.message : "Ocorreu um erro.", variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    }
    // Limpa o valor do input para permitir o re-upload do mesmo arquivo
    if (zipInputRef.current) {
        zipInputRef.current.value = "";
    }
  };

  const confirmImport = async () => {
    // Verificação de erros críticos de validação
    const hasCriticalErrors = Object.values(validationErrors).flat().some(
      (errMsg) => 
        typeof errMsg === 'string' && 
        (errMsg.toLowerCase().includes("inválido") || 
         errMsg.toLowerCase().includes("obrigatório") || 
         errMsg.toLowerCase().includes("já existe"))
    );

    if (hasCriticalErrors) {
      toast({
        title: "Erros Críticos de Validação",
        description: "Corrija os erros marcados como críticos antes de importar. Baixe o CSV de erros para detalhes.",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }
    
    if (parsedSuppliers.length === 0) {
        toast({ title: "Nenhum fornecedor para importar", description: "Não há dados de fornecedores válidos na lista de revisão.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;
    let errorCount = 0;
    const importAttemptId = crypto.randomUUID();
    let finalValidationErrors: ValidationErrors = { ...validationErrors }; // Começa com os erros de validação da planilha

    try {
      // Filtrar fornecedores que não têm erros de validação iniciais fatais.
      const suppliersToAttemptImport = parsedSuppliers.filter(supplier => {
        const errorKey = supplier.codigo || `Linha ${supplier.originalRowIndex}`;
        const errors = finalValidationErrors[errorKey] || [];
        return !errors.some(err => 
          err.toLowerCase().includes("inválido") || 
          err.toLowerCase().includes("obrigatório") || 
          err.toLowerCase().includes("já existe")
        );
      });

      if (suppliersToAttemptImport.length === 0 && parsedSuppliers.length > 0) {
         toast({ title: "Nenhum fornecedor válido para tentativa", description: "Todos os fornecedores na lista possuem erros críticos ou nenhum fornecedor para processar. Corrija-os e tente novamente.", variant: "destructive", duration: 7000 });
         setIsProcessing(false);
         return;
      }
      
      let uploadedImageMap: Record<string, string[]> = {};
      if (zipFile) {
        console.log('[confirmImport] Processing ZIP file for image uploads...');
        try {
          const zipData = await zipFile.arrayBuffer();
          // Nota: processImagesFromZip pode lançar seus próprios erros.
          uploadedImageMap = await processImagesFromZip(zipData);
          console.log('[confirmImport] ZIP file processed. Image map created.', uploadedImageMap);
          // Aqui, poderíamos opcionalmente atualizar os previewImages com as URLs reais do storage,
          // mas para a importação, o uploadedImageMap é o que importa.
        } catch (zipError: any) {
          console.error("[confirmImport] Error processing ZIP file:", zipError);
          toast({ title: "Erro ao Processar ZIP", description: `Falha ao processar arquivo ZIP: ${zipError.message || 'Erro desconhecido'}`, variant: "destructive" });
          // Salvar histórico com erro no ZIP
          await saveImportHistory({
            id: importAttemptId,
            filename: excelFile?.name || 'N/A', // Changed from file_name
            imported_by: user?.id, // Changed from imported_by_id
            imported_at: new Date().toISOString(),
            status: 'error',
            total_count: parsedSuppliers.length, // Changed from total_rows
            success_count: 0, // Changed from successful_rows
            error_count: parsedSuppliers.length, // Changed from failed_rows
            error_details: { global: [`Erro ao processar arquivo ZIP: ${zipError.message || 'Erro desconhecido'}`] }
          });
          setIsProcessing(false);
          return; // Interrompe a importação se o ZIP falhar
        }
      }

      console.log(`[confirmImport] Attempting to import ${suppliersToAttemptImport.length} suppliers.`);
      const results: ImportResult = await importSuppliers(
        suppliersToAttemptImport, 
        uploadedImageMap, // Passa o mapa de imagens REALMENTE enviadas
        (p) => setProgress(p)
      );
      
      successCount = results.successCount;
      // errorCount inicial da importação (Supabase)
      errorCount = results.errorCount; 

      // Atualizar finalValidationErrors com erros que ocorreram durante a importação no Supabase
      if (Object.keys(results.errors).length > 0) {
        Object.entries(results.errors).forEach(([key, messages]) => {
          if (!finalValidationErrors[key]) finalValidationErrors[key] = [];
          finalValidationErrors[key].push(...messages.map(m => `Falha na importação: ${m}`));
        });
      }
      setValidationErrors(finalValidationErrors); // Atualiza o estado de erros com os erros da importação

      // Calcular o número total de falhas: 
      // aqueles que falharam no Supabase + aqueles que nem foram tentados devido a erros de validação prévios.
      const notAttemptedCount = parsedSuppliers.length - suppliersToAttemptImport.length;
      const totalFailedRowsCalculated = results.errorCount + notAttemptedCount; // Renamed to avoid conflict

      await saveImportHistory({
        id: importAttemptId,
        filename: excelFile?.name || 'N/A', // Changed from file_name
        imported_by: user?.id, // Changed from imported_by_id
        imported_at: new Date().toISOString(),
        status: totalFailedRowsCalculated > 0 ? (successCount > 0 ? 'partial' : 'error') : 'success',
        total_count: parsedSuppliers.length, // Changed from total_rows
        success_count: successCount, // Changed from successful_rows
        error_count: totalFailedRowsCalculated, // Changed from failed_rows, used calculated value
        error_details: Object.keys(finalValidationErrors).length > 0 ? finalValidationErrors : undefined
      });

      toast({
        title: "Importação Concluída",
        description: `${successCount} fornecedores importados. ${totalFailedRowsCalculated} falharam ou não foram tentados.`,
        duration: 7000,
      });
      
      // Após a importação, atualiza o histórico na aba de histórico
      fetchHistoryLocal();
      // Considerar limpar excelFile e zipFile aqui ou mudar de aba
      // setActiveTab('history'); // ou de volta para upload, ou manter em review

    } catch (error: any) {
      console.error("[confirmImport] Critical error during bulk import process:", error);
      toast({ title: "Erro Crítico na Importação", description: error.message || "Ocorreu um erro grave e inesperado.", variant: "destructive" });
      // Garante que errorCount reflita que tudo falhou se um erro não capturado ocorreu
      const failedDueToException = parsedSuppliers.length - successCount; 
      
      await saveImportHistory({
        id: importAttemptId,
        filename: excelFile?.name || 'N/A', // Changed from file_name
        imported_by: user?.id, // Changed from imported_by_id
        imported_at: new Date().toISOString(),
        status: 'error',
        total_count: parsedSuppliers.length, // Changed from total_rows
        success_count: successCount, // Pode ser > 0 se o erro ocorreu após alguns sucessos parciais não tratados no results
        error_count: failedDueToException,
        error_details: { global: [`Erro crítico no processo: ${error.message || "Erro desconhecido"}`] }
      });
      fetchHistoryLocal(); // Atualiza histórico mesmo em erro crítico
    } finally {
      setIsProcessing(false);
      setProgress(100); // Garante que a barra de progresso vá até o fim
      // Decidir se limpa os arquivos ou não. 
      // Limpar pode ser bom para um novo ciclo, mas pode frustrar se o usuário quiser tentar de novo com pequenos ajustes.
      // setExcelFile(null);
      // setZipFile(null);
    }
  };

  const clearUploadArea = () => {
    setExcelFile(null);
    setZipFile(null);
    setParsedSuppliers([]);
    setValidationErrors({});
    setPreviewImages({});
    setProgress(0);
    if (excelInputRef.current) excelInputRef.current.value = "";
    if (zipInputRef.current) zipInputRef.current.value = "";
    setActiveTab('upload');
    toast({title: "Área de Upload Limpa", description: "Pode iniciar uma nova importação."});
  };

  const handleRetryFailed = async () => {
    const suppliersToRetry = parsedSuppliers.filter(supplier => {
      const errorKey = supplier.codigo || `Linha ${supplier.originalRowIndex}`;
      // Considera apenas aqueles que tiveram erros de importação (não de validação inicial crítica)
      // ou aqueles que não foram tentados mas não tinham erros críticos.
      const errors = validationErrors[errorKey];
      return errors && errors.some(e => e.startsWith("Falha na importação:")) || 
            !errors && !initialCriticalErrors(supplier); // Se não tem erro registrado E não tinha erro crítico inicial
    });

    if (suppliersToRetry.length === 0) {
      toast({ title: "Nenhum fornecedor para tentar novamente", description: "Não há fornecedores marcados com falha na importação ou aptos para nova tentativa." });
      return;
    }
    
    // Antes de chamar confirmImport novamente, precisamos limpar os erros *específicos de importação* desses fornecedores
    // para que `confirmImport` possa tentar processá-los novamente.
    // Não limpe erros de validação originais se eles ainda se aplicarem.
    const nextValidationErrors = { ...validationErrors };
    suppliersToRetry.forEach(s => {
      const errorKey = s.codigo || `Linha ${s.originalRowIndex}`;
      if (nextValidationErrors[errorKey]) {
        nextValidationErrors[errorKey] = nextValidationErrors[errorKey].filter(err => !err.startsWith("Falha na importação:"));
        if (nextValidationErrors[errorKey].length === 0) {
          delete nextValidationErrors[errorKey];
        }
      }
    });

    setParsedSuppliers(suppliersToRetry); // Define apenas os que serão tentados
    setValidationErrors(nextValidationErrors); // Define os erros limpos
    // O zipFile e excelFile devem permanecer os mesmos
    
    toast({ title: "Preparando para tentar novamente...", description: `Tentando importar ${suppliersToRetry.length} fornecedores novamente.` });
    // Pequeno delay para o estado atualizar antes de chamar confirmImport, se necessário
    // setTimeout(confirmImport, 100);
    await confirmImport(); // Chamar confirmImport para processar apenas os filtrados
  };

  // Helper para verificar se um fornecedor tinha erros críticos iniciais (para a lógica de retry)
  const initialCriticalErrors = (supplier: SupplierRowData): boolean => {
    const tempValidationErrors = {};
    const errors = validateSupplierRow(supplier, existingCodes, categoryNameToIdMap);
    if (errors.length > 0) {
      tempValidationErrors[supplier.codigo || `Linha ${supplier.originalRowIndex}`] = errors;
    }
    return errors.some(err => 
      err.toLowerCase().includes("inválido") || 
      err.toLowerCase().includes("obrigatório") || 
      err.toLowerCase().includes("já existe")
    );
  };

  // Debug logging for the current state in the render cycle
  console.log('[Review Tab Render] Active Tab:', activeTab);
  console.log('[Review Tab Render] Parsed Suppliers (length):', parsedSuppliers.length, parsedSuppliers);
  console.log('[Review Tab Render] Validation Errors:', validationErrors);
  console.log('[Review Tab Render] Is Processing:', isProcessing);
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8"> 
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Importação em Massa de Fornecedores</h1> 
        
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('[Tab Change] Changing from', activeTab, 'to', value);
          console.log('[Tab Change] Current parsedSuppliers length:', parsedSuppliers.length);
          setActiveTab(value as 'upload' | 'review' | 'history');
        }}>
          <TabsList className="w-full max-w-lg grid grid-cols-3 mb-8 shadow-sm"> 
            <TabsTrigger value="upload" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"> 
              <Upload className="h-4 w-4 mr-2" /> Upload
            </TabsTrigger>
            <TabsTrigger value="review" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-2" /> Revisão
            </TabsTrigger>
            <TabsTrigger value="history" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-4 w-4 mr-2" /> Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-8"> 
            <div className="grid md:grid-cols-2 gap-8"> 
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300"> 
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-700"> 
                    <FileSpreadsheet className="h-6 w-6 mr-2 text-primary" /> 
                    1. Planilha de Fornecedores
                  </CardTitle>
                  <CardDescription>
                    Envie um arquivo Excel (.xlsx) ou CSV (.csv) com os dados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => excelInputRef.current?.click()}> 
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" /> 
                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                      Arraste ou clique para selecionar
                    </p>
                    <Input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelUpload}
                      className="hidden" 
                    />
                     {excelFile && <p className="text-xs text-gray-500 mt-1">{excelFile.name}</p>}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={downloadTemplate} className="w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Modelo
                    </Button>
                  </div>
                </CardContent>
                {excelFile && (
                  <CardFooter className="text-sm text-muted-foreground">
                    <FileSpreadsheet className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{excelFile.name}</span>
                    {parsedSuppliers.length > 0 && (
                      <Badge className="ml-auto bg-blue-100 text-blue-700">
                        {parsedSuppliers.length} {parsedSuppliers.length === 1 ? 'fornecedor' : 'fornecedores'}
                      </Badge>
                    )}
                  </CardFooter>
                )}
              </Card>
              
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-gray-700">
                    <FileArchive className="h-6 w-6 mr-2 text-primary" />
                    2. Imagens (Opcional)
                  </CardTitle>
                  <CardDescription>
                    Envie um arquivo ZIP com as imagens (ex: <code className="text-xs bg-gray-200 p-0.5 rounded">CODIGO-img1.jpg</code>).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => zipInputRef.current?.click()}>
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                      Arraste ou clique para selecionar ZIP
                    </p>
                    <Input
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="hidden" 
                    />
                    {zipFile && <p className="text-xs text-gray-500 mt-1">{zipFile.name}</p>}
                  </div>
                   <p className="text-xs text-center text-muted-foreground">
                      Nomeie as imagens no ZIP com o código do fornecedor (ex: F001-img1.jpg).
                    </p>
                </CardContent>
                 {zipFile && (
                  <CardFooter className="text-sm text-muted-foreground">
                      <FileArchive className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{zipFile.name}</span>
                      {Object.keys(previewImages).length > 0 && (
                        <Badge className="ml-auto bg-green-100 text-green-700">
                           {Object.keys(previewImages).length} {Object.keys(previewImages).length === 1 ? 'fornecedor com imagens' : 'fornecedores com imagens'}
                        </Badge>
                      )}
                  </CardFooter>
                )}
              </Card>
            </div>
            
            {isProcessing && excelFile && ( // Show progress only if excelFile is selected to avoid showing on initial load
              <div className="space-y-2 p-4 border rounded-md bg-gray-50">
                <p className="text-sm text-muted-foreground text-center font-medium">Processando arquivos...</p>
                <Progress value={progress} className="w-full h-3" /> 
              </div>
            )}
            
            {parsedSuppliers.length > 0 && !isProcessing && (
              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab('review')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Avançar para Revisão ({parsedSuppliers.length}) <Check className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="review" className="space-y-6">
            {(() => { // IIFE for logging
              console.log('[Review Tab Render] Active Tab:', activeTab);
              console.log('[Review Tab Render] Parsed Suppliers (length):', parsedSuppliers.length, parsedSuppliers);
              console.log('[Review Tab Render] Validation Errors:', validationErrors);
              console.log('[Review Tab Render] Is Processing:', isProcessing);
              return null;
            })()}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-700">Revisar Dados e Importar</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setActiveTab('upload')}>Voltar</Button>
                {Object.values(validationErrors).some(errs => errs.length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const csv = exportValidationErrorsToCSV(validationErrors);
                      downloadCSV(csv, `erros_validacao_${excelFile?.name.split('.')[0] || 'importacao'}.csv`);
                    }}
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Erros
                  </Button>
                )}
                <Button 
                  onClick={confirmImport}
                  disabled={
                    parsedSuppliers.length === 0 || 
                    isProcessing
                  }
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Import className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Importando...' : 
                    `Confirmar Importação (${parsedSuppliers.filter(s => !(validationErrors[s.codigo]?.length > 0)).length} válidos de ${parsedSuppliers.length})`
                  }
                </Button>
              </div>
            </div>
            
            {!Object.keys(existingCategories).length && parsedSuppliers.length > 0 && (
              <Alert variant="default" className="shadow-md border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500"> 
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Atenção: Nenhuma Categoria Cadastrada ou Mapeada</AlertTitle>
                <AlertDescription>
                  Não há categorias cadastradas no sistema ou o mapa de nomes para IDs não pôde ser construído. 
                  Os fornecedores serão importados, mas as categorias listadas na planilha não serão vinculadas 
                  corretamente se os nomes não corresponderem aos cadastrados no sistema.
                </AlertDescription>
              </Alert>
            )}
            
            {isProcessing && ( 
              <div className="space-y-2 p-4 border rounded-md bg-gray-50">
                <p className="text-sm text-muted-foreground text-center font-medium">Importando fornecedores...</p>
                <Progress value={progress} className="w-full h-3" />
              </div>
            )}

            {!isProcessing && parsedSuppliers.length > 0 && (
              <Card className="overflow-hidden shadow-lg"> 
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle>Fornecedores para Importação ({parsedSuppliers.length})</CardTitle>
                    <CardDescription>Revise os dados abaixo. Fornecedores com erros não serão importados.</CardDescription>
                </CardHeader>
                <CardContent className="p-0"> 
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100"> 
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Local (Cidade/UF)</TableHead>
                        <TableHead>Categorias (Planilha)</TableHead>
                        <TableHead>Imagens (ZIP Preview)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedSuppliers.map((supplier, idx) => {
                        const errorsForSupplier = validationErrors[supplier.codigo || `review-err-${idx}`] || [];
                        const hasErrors = errorsForSupplier.length > 0;
                        const supplierZipImages = previewImages[supplier.codigo] || [];
                        const categoriesFromSheetAsNames = supplier.tipo_fornecedor?.split(',').map(t => t.trim()).filter(t => t) || [];
                        
                        return (
                          <TableRow key={supplier.codigo || `review-key-${idx}`} className={hasErrors ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                            <TableCell>
                              {hasErrors ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="destructive" className="cursor-pointer">
                                        <X className="h-3 w-3 mr-1" /> Erro
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-destructive text-destructive-foreground">
                                      <p className="font-semibold mb-1">Erros:</p>
                                      <ul className="list-disc pl-4 text-xs">
                                        {errorsForSupplier.slice(0,3).map((err, i) => <li key={i}>{err}</li>)}
                                        {errorsForSupplier.length > 3 && <li>E mais {errorsForSupplier.length - 3}...</li>}
                                      </ul>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" /> Válido
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{supplier.codigo}</TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{supplier.nome}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={supplier.descricao}>
                                {supplier.descricao}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{supplier.cidade && supplier.estado ? `${supplier.cidade}/${supplier.estado}` : 'N/A'}</TableCell>
                            <TableCell>
                              {categoriesFromSheetAsNames.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {categoriesFromSheetAsNames.map((catNameFromSheet, i) => {
                                    const normalizedSheetName = normalizeString(catNameFromSheet);
                                    const categoryId = categoryNameToIdMap.get(normalizedSheetName);
                                    const actualDbName = categoryId ? existingCategories.get(categoryId) : undefined;

                                    return (
                                      <Badge 
                                        key={i} 
                                        variant={categoryId ? "default" : "outline"} 
                                        className="text-xs"
                                        title={categoryId ? `ID: ${categoryId}` : `Nome da planilha: ${catNameFromSheet}`}
                                      >
                                        {actualDbName || catNameFromSheet}
                                        {!categoryId && !actualDbName && " (Nova?)"} {/* Ajustado para mostrar (Nova?) apenas se não mapeado */}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : <span className="text-xs text-muted-foreground">Nenhuma</span> }
                            </TableCell>
                            <TableCell>
                               {supplierZipImages.length > 0 ? (
                                <div className="flex space-x-2">
                                  {supplierZipImages.slice(0, 2).map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} className="w-10 h-10 rounded border overflow-hidden bg-muted">
                                      <img src={imgUrl} alt={`Preview ${imgIdx + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                  ))}
                                  {supplierZipImages.length > 2 && (
                                    <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                      +{supplierZipImages.length - 2}
                                    </div>
                                  )}
                                </div>
                              ) : supplier.imagens && supplier.imagens.trim() !== '' ? (
                                <span className="text-xs text-orange-600 italic">ZIP pendente</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Nenhuma</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
             {!isProcessing && parsedSuppliers.length === 0 && Object.keys(existingCategories).length && ( // Esta é a mensagem correta para quando não há fornecedores
                <div className="text-center py-10 text-muted-foreground">
                    <FileSpreadsheet className="mx-auto h-12 w-12 mb-4"/>
                    <p>Nenhum dado de fornecedor para revisar.</p>
                    <p className="text-sm">Volte para a aba 'Upload' para carregar uma planilha.</p>
                </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-2xl font-semibold text-gray-700">Histórico de Importações</h2>
                <Button variant="outline" onClick={fetchHistoryLocal} disabled={isProcessing}>
                    <History className="mr-2 h-4 w-4"/> Atualizar Histórico
                </Button>
            </div>
            
            {isProcessing && importHistory.length === 0 && ( 
                 <div className="space-y-2 p-4 border rounded-md bg-gray-50">
                    <p className="text-sm text-muted-foreground text-center font-medium">Carregando histórico...</p>
                    <Progress value={progress} className="w-full h-3" />
                </div>
            )}

            {!isProcessing && importHistory.length === 0 ? (
              <div className="p-10 text-center border rounded-lg bg-gray-50 shadow">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground font-medium">Nenhum histórico de importação encontrado.</p>
                <p className="text-sm text-muted-foreground">Suas importações aparecerão aqui.</p>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-lg"> 
                 <CardHeader className="bg-gray-50 border-b">
                    <CardTitle>Registros de Importação Recentes</CardTitle>
                 </CardHeader>
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                        <TableHead className="w-[180px]">Data e Hora</TableHead>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contagens (Total/Sucesso/Falha)</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {importHistory.map((item) => (
                        <TableRow key={item.id} className="hover:bg-gray-50">
                            <TableCell className="text-xs">
                            {new Date(item.imported_at).toLocaleString('pt-BR', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })}
                            </TableCell>
                            <TableCell className="text-xs font-medium truncate max-w-[200px]" title={item.filename}>{item.filename}</TableCell>
                            <TableCell>
                            {item.status === 'success' ? (
                                <Badge className="bg-green-100 text-green-700">Sucesso</Badge>
                            ) : item.status === 'error' ? (
                                <Badge variant="destructive">Com Erros</Badge>
                            ) : (
                                <Badge variant="outline">Pendente</Badge>
                            )}
                            </TableCell>
                            <TableCell className="text-xs">
                                {item.total_count} / <span className="text-green-600">{item.success_count}</span> / <span className="text-red-600">{item.error_count}</span>
                            </TableCell>
                            <TableCell className="text-right">
                            {item.error_count > 0 && item.error_details && Object.keys(item.error_details as ValidationErrors).length > 0 && (
                                <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs"
                                onClick={() => {
                                    const errorCSV = exportValidationErrorsToCSV(item.error_details as ValidationErrors);
                                    if (errorCSV) {
                                    downloadCSV(errorCSV, `erros_${item.filename.split('.')[0] || 'importacao'}_${new Date(item.imported_at).toISOString().split('T')[0]}.csv`);
                                    } else {
                                    toast({ title: "Sem detalhes de erro para exportar."});
                                    }
                                }}
                                >
                                <Download className="h-3 w-3 mr-1" /> Erros
                                </Button>
                            )}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
