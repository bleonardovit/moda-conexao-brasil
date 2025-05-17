import { useState, useRef, useEffect } from 'react';
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
} from '@/services/supplierBulkService';

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

export default function SuppliersBulkUpload() {
  const { toast } = useToast();
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
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set());
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          toast({
            variant: "destructive",
            title: "Erro ao carregar categorias",
            description: categoriesError.message
          });
        } else {
          const categoriesMap = new Map();
          (categoriesData || []).forEach(cat => categoriesMap.set(cat.id, cat.name));
          setExistingCategories(categoriesMap);
        }
        
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('code');
        
        if (suppliersError) {
          console.error('Error fetching supplier codes:', suppliersError);
          toast({
            variant: "destructive",
            title: "Erro ao carregar códigos de fornecedores",
            description: suppliersError.message,
          });
        } else {
          const codesSet = new Set((suppliersData || []).map(s => s.code));
          setExistingCodes(codesSet);
        }
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados iniciais",
            description: error instanceof Error ? error.message : "Erro desconhecido.",
        });
      }
    };
    
    fetchExistingData();
    fetchImportHistory(); 
  }, [toast]);
  
  const fetchImportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_import_history')
        .select('*')
        .order('imported_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching import history:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar histórico",
          description: error.message
        });
        return;
      }
      setImportHistory((data as SupplierImportHistory[] || []));
    } catch (error) {
      console.error('Error in fetchImportHistory:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado ao carregar histórico",
        description: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  };
    
  function normalize(str: string) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); 
  }
  
  const downloadTemplate = () => {
    const exampleData = [
      [
        'F001', 'Moda Fashion SP', 'Roupas femininas atacado', '@modafashionsp', '11999999999', 'https://modafashion.com',
        'medio', '10 peças', 'São Paulo', 'SP',
        'correios,transportadora', 'sim', 'pix,cartao', 
        'uuid-categoria-1,uuid-categoria-2', 
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
    
    setExcelFile(file);
    setProgress(0);
    setIsProcessing(true);
    setParsedSuppliers([]); 
    setValidationErrors({});
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' }); 
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: TEMPLATE_HEADERS, 
        range: 1 
      }) as Partial<SupplierRowData>[];

      const suppliers = jsonData.filter(row => 
        Object.values(row).some(value => value !== null && value !== undefined && String(value).trim() !== '')
      ).map(row => ({
        codigo: String(row.codigo || ''),
        nome: String(row.nome || ''),
        descricao: String(row.descricao || ''),
        instagram: String(row.instagram || ''),
        whatsapp: String(row.whatsapp || ''),
        site: String(row.site || ''),
        preco_medio: String(row.preco_medio || ''),
        quantidade_minima: String(row.quantidade_minima || ''),
        cidade: String(row.cidade || ''),
        estado: String(row.estado || ''),
        envio: String(row.envio || ''),
        precisa_cnpj: String(row.precisa_cnpj || ''),
        formas_pagamento: String(row.formas_pagamento || ''),
        tipo_fornecedor: String(row.tipo_fornecedor || ''),
        imagens: String(row.imagens || ''),
      }));
      
      setParsedSuppliers(suppliers);
      
      const currentExistingCodes = new Set(existingCodes); 
      const errors: ValidationErrors = {};
      suppliers.forEach((supplier, index) => {
        const supplierErrors = validateSupplierRow(supplier, currentExistingCodes, existingCategories);
        if (supplierErrors.length > 0) {
          errors[supplier.codigo || `linha-${index + 2}`] = supplierErrors; 
        }
      });
      
      setValidationErrors(errors);
      setProgress(100);
      
      toast({
        title: "Planilha processada",
        description: `${suppliers.length} fornecedores encontrados. ${Object.keys(errors).length} com erros de validação.`
      });
      
      if (suppliers.length > 0) {
        setActiveTab('review');
      }
    } catch (error) {
      console.error('Erro ao processar planilha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar planilha",
        description: error instanceof Error ? error.message : "Verifique o formato e tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setZipFile(file);
    setProgress(0);
    setIsProcessing(true);
    setPreviewImages({});
    
    try {
      const JSZip = await import('jszip').then(mod => mod.default); 
      const data = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(data);
      const imagesPreview: Record<string, string[]> = {};
      
      const filePromises: Promise<void>[] = [];
      let processedCount = 0;
      const totalFiles = Object.values(zip.files).filter(f => !f.dir && /\.(jpe?g|png|gif|webp)$/i.test(f.name)).length;

      for (const filename of Object.keys(zip.files)) {
        const fileInZip = zip.files[filename];
        if (fileInZip.dir || !/\.(jpe?g|png|gif|webp)$/i.test(filename)) {
          continue;
        }

        filePromises.push(
          (async () => {
            const match = filename.match(/^([^-]+)-/) || filename.match(/^([^.]+)\./);
            const supplierCode = match ? match[1] : null;

            if (supplierCode) {
              const blob = await fileInZip.async("blob");
              const imageUrl = URL.createObjectURL(blob);
              if (!imagesPreview[supplierCode]) {
                imagesPreview[supplierCode] = [];
              }
              imagesPreview[supplierCode].push(imageUrl);
            }
            processedCount++;
            setProgress(Math.floor((processedCount / totalFiles) * 100));
          })()
        );
      }
      
      await Promise.all(filePromises);
      setPreviewImages(imagesPreview);
      setProgress(100);
      
      if (parsedSuppliers.length > 0) {
        const newErrors = { ...validationErrors };
        parsedSuppliers.forEach(supplier => {
          if (supplier.imagens && supplier.imagens.trim() !== '' && !imagesPreview[supplier.codigo]) {
            if (!newErrors[supplier.codigo]) newErrors[supplier.codigo] = [];
            newErrors[supplier.codigo].push('Imagens listadas na planilha não encontradas no arquivo ZIP.');
          }
        });
        setValidationErrors(newErrors);
      }
      
      toast({
        title: "Arquivo ZIP processado",
        description: `Imagens de preview para ${Object.keys(imagesPreview).length} fornecedores.`
      });

    } catch (error) {
      console.error('Erro ao processar ZIP:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar ZIP",
        description: error instanceof Error ? error.message : "Verifique o arquivo e tente novamente."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = async () => {
    if (parsedSuppliers.length === 0) {
      toast({ title: "Nenhum fornecedor para importar", description: "Faça upload de uma planilha.", variant: "destructive" });
      return;
    }

    const currentValidationErrors = { ...validationErrors };
    parsedSuppliers.forEach((supplier, index) => {
        const supplierErrors = validateSupplierRow(supplier, existingCodes, existingCategories);
        if (supplierErrors.length > 0) {
          currentValidationErrors[supplier.codigo || `review-err-${index}`] = supplierErrors;
        }
     });
     setValidationErrors(currentValidationErrors);

    if (Object.keys(currentValidationErrors).some(key => currentValidationErrors[key]?.length > 0)) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "Corrija os erros antes de importar."
      });
      setActiveTab('review'); 
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const { data: buckets, error: listBucketError } = await supabase.storage.listBuckets();
      if (listBucketError) {
        console.error("Erro ao listar buckets:", listBucketError);
        toast({
            variant: "destructive",
            title: "Erro ao verificar buckets",
            description: `Não foi possível verificar os buckets de armazenamento: ${listBucketError.message}`
        });
        setIsProcessing(false);
        return;
      }
      
      const bucketExists = buckets?.some(b => b.name === 'supplier-images');
      
      if (!bucketExists) {
        toast({ title: "Criando bucket de imagens...", description: "Aguarde um momento."});
        const { error: createBucketError } = await supabase.storage.createBucket('supplier-images', {
          public: true, 
        });
        
        if (createBucketError) {
          const msg = createBucketError.message.toLowerCase();
          if (msg.includes('already exist') || msg.includes('já existe')) {
            toast({ title: "Aviso", description: "Bucket 'supplier-images' já existe. Continuando..." });
          } else {
            console.error("Erro ao criar bucket:", createBucketError);
            toast({
                variant: "destructive",
                title: "Erro ao criar bucket",
                description: `Erro ao criar bucket 'supplier-images': ${createBucketError.message}`
            });
            setIsProcessing(false);
            return;
          }
        } else {
          toast({ title: "Bucket 'supplier-images' criado com sucesso!" });
        }
      }
      setProgress(5); 
      
      let imageMap: Record<string, string[]> = {};
      if (zipFile) {
        toast({ title: "Processando imagens do ZIP...", description: "Isso pode levar alguns minutos."});
        const zipData = await zipFile.arrayBuffer();
        imageMap = await processImagesFromZip(zipData, 'supplier-images');
        setProgress(30); 
        toast({ title: "Imagens processadas", description: `${Object.values(imageMap).flat().length} imagens carregadas para o armazenamento.` });
      }
      
      toast({ title: "Importando fornecedores...", description: "Aguarde..." });
      const result = await importSuppliers(
        parsedSuppliers, 
        imageMap,
        (p) => setProgress(30 + Math.floor(p * 0.6)) 
      );
      
      setProgress(95);
      
      await saveImportHistory({
        filename: excelFile?.name || 'importacao_manual.xlsx',
        total_count: parsedSuppliers.length,
        success_count: result.successCount,
        error_count: result.errorCount,
        status: result.successCount === parsedSuppliers.length && result.errorCount === 0 ? 'success' : 'error',
        error_details: result.errorCount > 0 ? result.errors : undefined,
      });
      
      setProgress(100);
      
      if (result.errorCount === 0 && result.successCount === parsedSuppliers.length) {
        toast({
          title: "Importação concluída com sucesso!",
          description: `${result.successCount} fornecedores importados.`,
          duration: 5000,
        });
        setParsedSuppliers([]);
        setPreviewImages({});
        setExcelFile(null);
        setZipFile(null);
        setValidationErrors({});
        if (excelInputRef.current) excelInputRef.current.value = '';
        if (zipInputRef.current) zipInputRef.current.value = '';
        fetchImportHistory(); 
        setActiveTab('history');
      } else {
         toast({
          variant: "destructive",
          title: "Importação concluída com erros",
          description: `${result.successCount} fornecedores importados, ${result.errorCount} com erro. Verifique a aba de revisão ou o histórico.`,
          duration: 7000,
        });
        setValidationErrors(result.errors); 
        fetchImportHistory(); 
        setActiveTab('review');
      }
      
    } catch (error) {
      console.error('Erro catastrófico durante importação:', error);
      toast({
        variant: "destructive",
        title: "Erro crítico na importação",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
      setProgress(0); 
      await saveImportHistory({
        filename: excelFile?.name || 'import_critical_fail.xlsx',
        total_count: parsedSuppliers.length,
        success_count: 0,
        error_count: parsedSuppliers.length, 
        status: 'error',
        error_details: { global: ['Erro crítico no processo: ' + (error instanceof Error ? error.message : "Desconhecido")] },
      });
      fetchImportHistory();
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8"> 
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Importação em Massa de Fornecedores</h1> 
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'review' | 'history')}>
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
            
            {isProcessing && (
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
                    Object.values(validationErrors).some(errs => errs.length > 0) ||
                    isProcessing
                  }
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Import className="mr-2 h-5 w-5" />
                  {isProcessing ? 'Importando...' : `Confirmar Importação (${parsedSuppliers.length - Object.keys(validationErrors).filter(k => validationErrors[k]?.length > 0).length} válidos)`}
                </Button>
              </div>
            </div>
            
            {Object.values(validationErrors).some(errs => errs.length > 0) && (
              <Alert variant="destructive" className="shadow-md">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Erros de Validação Encontrados</AlertTitle>
                <AlertDescription>
                  Existem {Object.keys(validationErrors).filter(k => validationErrors[k]?.length > 0).length} fornecedores com erros que precisam ser corrigidos na planilha e reenviados.
                   Você pode exportar um relatório detalhado dos erros.
                </AlertDescription>
              </Alert>
            )}
            
            {existingCategories.size === 0 && parsedSuppliers.length > 0 && (
              <Alert variant="default" className="shadow-md border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500"> 
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Atenção: Nenhuma Categoria Cadastrada</AlertTitle>
                <AlertDescription>
                  Não há categorias cadastradas no sistema. Os fornecedores serão importados, mas as categorias listadas na planilha não serão vinculadas até que sejam criadas no sistema com os IDs correspondentes.
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
                        const categoriesFromSheet = supplier.tipo_fornecedor?.split(',').map(t => t.trim()).filter(t => t) || [];
                        
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
                              {categoriesFromSheet.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {categoriesFromSheet.map((catId, i) => (
                                    <Badge key={i} variant={existingCategories.has(catId) ? "default" : "outline"} className="text-xs">
                                      {existingCategories.get(catId) || catId}
                                      {!existingCategories.has(catId) && " (Novo?)"}
                                    </Badge>
                                  ))}
                                </div>
                              ) : <span className="text-xs text-muted-foreground">Nenhuma</span> }
                            </TableCell>
                            <TableCell>
                              {supplierZipImages.length > 0 ? (
                                <div className="flex gap-1 items-center">
                                  {supplierZipImages.slice(0, 3).map((img, i) => (
                                    <img 
                                      key={i}
                                      src={img} 
                                      alt={`Preview ${i}`} 
                                      className="h-8 w-8 object-cover rounded border" 
                                    />
                                  ))}
                                  {supplierZipImages.length > 3 && (
                                    <Badge variant="outline" className="text-xs">+{supplierZipImages.length - 3}</Badge>
                                  )}
                                </div>
                              ) : supplier.imagens && supplier.imagens.trim() !== '' ? (
                                <span className="text-xs text-amber-600">Imagens listadas, mas não no ZIP</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sem imagens</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
                 {parsedSuppliers.length === 0 && !isProcessing && (
                    <CardContent>
                        <p className="text-center text-muted-foreground py-8">Nenhum fornecedor carregado da planilha.</p>
                    </CardContent>
                )}
              </Card>
            )}
             {parsedSuppliers.length === 0 && !isProcessing && (
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
                <Button variant="outline" onClick={fetchImportHistory} disabled={isProcessing}>
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
