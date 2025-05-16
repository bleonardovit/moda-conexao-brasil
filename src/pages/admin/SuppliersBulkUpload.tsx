
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
import { Supplier, SupplierImportHistory } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { 
  SupplierRowData, 
  validateSupplierRow,
  importSuppliers, 
  processImagesFromZip, 
  saveImportHistory,
  ValidationErrors
} from '@/services/supplierBulkService';

// Template para download
const TEMPLATE_HEADERS = [
  'Código', 'Nome', 'Descrição', 'Instagram', 'WhatsApp', 'Site', 
  'Preço médio (baixo/médio/alto)', 'Condições de compra', 'Cidade', 'Estado',
  'Envio (correios,transportadora,entrega)', 'Precisa de CNPJ (sim/não)', 
  'Quantidade mínima', 'Formas de pagamento (pix,cartão,boleto)', 
  'Tipo de fornecedor (categorias separadas por vírgula)', 'Avaliação (1-5)',
  'Nomes das imagens (separadas por vírgula)'
];

// Componente para a página de upload em massa
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

  // Fetch existing categories and supplier codes on mount
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        // Fetch categories
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
        
        // Fetch existing supplier codes
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('code');
        
        if (suppliersError) {
          console.error('Error fetching supplier codes:', suppliersError);
        } else {
          const codesSet = new Set((suppliersData || []).map(s => s.code));
          setExistingCodes(codesSet);
        }
        
        // Fetch import history
        fetchImportHistory();
        
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchExistingData();
  }, [toast]);
  
  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_import_history')
        .select('*')
        .order('imported_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching import history:', error);
        return;
      }
      
      setImportHistory(data || []);
    } catch (error) {
      console.error('Error in fetchImportHistory:', error);
    }
  };
  
  // Função para normalizar strings (remover acentos e padronizar minúsculas)
  function normalize(str: string) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "");
  }
  
  // Gerar template para download
  const downloadTemplate = () => {
    // Dados de exemplo
    const exampleData = [
      [
        'F001',
        'Moda Fashion SP',
        'Atacado de roupas femininas com foco em tendências atuais',
        '@modafashionsp',
        '11999999999',
        'https://modafashionsp.com.br',
        'médio',
        'Pedido mínimo R$ 300,00',
        'São Paulo',
        'SP',
        'correios,transportadora',
        'sim',
        '10 peças',
        'pix,cartão,boleto',
        '1,2,3',
        '4',
        'F001-img1.jpg,F001-img2.jpg'
      ],
      [
        'F002',
        'Plus Size Goiânia',
        'Especializada em moda plus size feminina',
        '@plussizegoiania',
        '62999999999',
        'https://plussizegoiania.com.br',
        'baixo',
        'Pedido mínimo R$ 500,00',
        'Goiânia',
        'GO',
        'correios,entrega',
        'não',
        '5 peças',
        'pix,boleto',
        '3,4',
        '5',
        'F002-img1.jpg,F002-img2.jpg,F002-img3.jpg'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ...exampleData
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fornecedores');
    XLSX.writeFile(workbook, 'template_fornecedores.xlsx');
    
    toast({
      title: "Template baixado com sucesso",
      description: "Utilize este modelo para preparar seus dados para importação."
    });
  };
  
  // Function to export validation errors to CSV
  const exportValidationErrorsToCSV = (errors: ValidationErrors) => {
    if (!errors || Object.keys(errors).length === 0) return '';
    
    const header = 'Código,Erro';
    const lines = Object.entries(errors).flatMap(([code, msgs]) =>
      (Array.isArray(msgs) ? msgs : []).map(msg => `${code},"${msg.replace(/"/g, '""')}"`)
    );
    
    return [header, ...lines].join('\n');
  };

  // Function to download CSV
  const downloadCSV = (csvContent: string, filename = 'erros_importacao.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle Excel file upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setExcelFile(file);
    setProgress(0);
    setIsProcessing(true);
    setValidationErrors({});
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Skip the header row
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      // Map data to the expected format
      const suppliers: SupplierRowData[] = rows.map(row => {
        const supplier: any = {};
        headers.forEach((header: string, index: number) => {
          if (!header) return; // Skip columns with no header
          
          const normalizedHeader = header
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '_');
          
          supplier[normalizedHeader] = row[index] !== undefined ? String(row[index]) : '';
        });
        return supplier as SupplierRowData;
      });
      
      setParsedSuppliers(suppliers);
      
      // Validate each supplier
      const errors: ValidationErrors = {};
      suppliers.forEach(supplier => {
        const supplierErrors = validateSupplierRow(supplier, existingCodes, existingCategories);
        if (supplierErrors.length > 0) {
          errors[supplier.codigo || 'unknown'] = supplierErrors;
        }
      });
      
      setValidationErrors(errors);
      setProgress(100);
      setIsProcessing(false);
      
      toast({
        title: "Planilha processada com sucesso",
        description: `Encontrados ${suppliers.length} fornecedores na planilha.`
      });
      
      if (suppliers.length > 0) {
        setActiveTab('review');
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Erro ao processar planilha",
        description: "Verifique se o formato está correto e tente novamente."
      });
    }
  };
  
  // Handle ZIP file upload
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setZipFile(file);
    setProgress(0);
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(data);
      const images: Record<string, string[]> = {};
      
      let processed = 0;
      const total = Object.keys(zip.files).length;
      
      // Process each file in the ZIP
      const promises = Object.keys(zip.files).map(async (filename) => {
        if (zip.files[filename].dir) return;
        
        // Check if it's an image
        if (!/\.(jpe?g|png|gif|webp)$/i.test(filename)) return;
        
        // Extract code from filename (F001-img1.jpg -> F001)
        const match = filename.match(/^([^-]+)-/) || [null, filename.split('.')[0]];
        const supplierCode = match[1];
        
        if (!supplierCode) return;
        
        // Read as blob for preview
        const blob = await zip.files[filename].async("blob");
        const imageUrl = URL.createObjectURL(blob);
        
        // Add to image map
        if (!images[supplierCode]) {
          images[supplierCode] = [];
        }
        images[supplierCode].push(imageUrl);
        
        processed++;
        setProgress(Math.floor((processed / total) * 100));
      });
      
      await Promise.all(promises);
      setPreviewImages(images);
      setProgress(100);
      setIsProcessing(false);
      
      // Validate correspondence between images and suppliers
      if (parsedSuppliers.length > 0) {
        const newErrors = { ...validationErrors };
        
        parsedSuppliers.forEach(supplier => {
          if (supplier.imagens && !images[supplier.codigo]) {
            if (!newErrors[supplier.codigo]) {
              newErrors[supplier.codigo] = [];
            }
            newErrors[supplier.codigo].push('Imagens mencionadas não encontradas no ZIP');
          }
        });
        
        setValidationErrors(newErrors);
      }
      
      toast({
        title: "Arquivo ZIP processado com sucesso",
        description: `Imagens extraídas para ${Object.keys(images).length} fornecedores.`
      });
    } catch (error) {
      console.error('Erro ao processar ZIP:', error);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Erro ao processar arquivo ZIP",
        description: "Verifique se o formato está correto e tente novamente."
      });
    }
  };
  
  // Confirm import
  const confirmImport = async () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast({
        variant: "destructive",
        title: "Erro na validação",
        description: "Corrija os erros antes de importar os fornecedores."
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Check if supplier-images bucket exists, create if not
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        throw new Error(`Erro ao verificar buckets: ${bucketError.message}`);
      }
      
      const bucketExists = buckets.some(b => b.name === 'supplier-images');
      
      if (!bucketExists) {
        const { error: createBucketError } = await supabase.storage.createBucket('supplier-images', {
          public: true
        });
        
        if (createBucketError) {
          throw new Error(`Erro ao criar bucket: ${createBucketError.message}`);
        }
      }
      
      // Process ZIP file if available
      let imageMap: Record<string, string[]> = {};
      
      if (zipFile) {
        try {
          setProgress(10);
          const zipData = await zipFile.arrayBuffer();
          imageMap = await processImagesFromZip(zipData, 'supplier-images');
          setProgress(40);
        } catch (error) {
          console.error('Error processing ZIP file:', error);
          toast({
            variant: "destructive",
            title: "Erro ao processar imagens",
            description: error instanceof Error ? error.message : "Erro desconhecido"
          });
          // Continue without images
        }
      }
      
      // Import suppliers
      const result = await importSuppliers(
        parsedSuppliers, 
        imageMap,
        (progress) => setProgress(40 + Math.floor(progress * 0.5))
      );
      
      setProgress(90);
      
      // Save import history
      await saveImportHistory({
        filename: excelFile?.name || 'import.xlsx',
        totalSuppliers: parsedSuppliers.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        status: result.success ? 'success' : 'error'
      });
      
      setProgress(100);
      
      // Show result
      if (result.success) {
        toast({
          title: "Importação concluída com sucesso",
          description: `${result.successCount} fornecedores foram importados.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Importação concluída com erros",
          description: `${result.successCount} importados, ${result.errorCount} com erro.`
        });
        
        setValidationErrors(result.errors);
        setActiveTab('review');
      }
      
      // Refresh import history
      fetchImportHistory();
      
      // Reset if successful
      if (result.success) {
        setParsedSuppliers([]);
        setPreviewImages({});
        setExcelFile(null);
        setZipFile(null);
        
        if (excelInputRef.current) excelInputRef.current.value = '';
        if (zipInputRef.current) zipInputRef.current.value = '';
        
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Error during import process:', error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error instanceof Error ? error.message : "Erro desconhecido durante o processo de importação"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-6">Importação em Massa de Fornecedores</h1>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="w-full max-w-md grid grid-cols-3 mb-6">
            <TabsTrigger value="upload" className="rounded-l-md">Upload</TabsTrigger>
            <TabsTrigger value="review">Revisão</TabsTrigger>
            <TabsTrigger value="history" className="rounded-r-md">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Card de upload de planilha */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-2" />
                    Upload de Planilha
                  </CardTitle>
                  <CardDescription>
                    Faça o upload de um arquivo Excel ou CSV com os dados dos fornecedores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste ou clique para selecionar uma planilha
                    </p>
                    <Input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelUpload}
                      className="w-full max-w-xs"
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar modelo de planilha
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  {excelFile && (
                    <div className="w-full flex items-center">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      <span className="text-sm">{excelFile.name}</span>
                      {parsedSuppliers.length > 0 && (
                        <Badge className="ml-auto">
                          {parsedSuppliers.length} fornecedores
                        </Badge>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              {/* Card de upload de ZIP */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileArchive className="h-5 w-5 mr-2" />
                    Upload de Imagens (ZIP)
                  </CardTitle>
                  <CardDescription>
                    Faça o upload de um arquivo ZIP contendo as imagens dos fornecedores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FileArchive className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      As imagens devem estar nomeadas com o código do fornecedor (ex: F001-img1.jpg)
                    </p>
                    <Input
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className="w-full max-w-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  {zipFile && (
                    <div className="w-full flex items-center">
                      <FileArchive className="h-4 w-4 mr-2" />
                      <span className="text-sm">{zipFile.name}</span>
                      {Object.keys(previewImages).length > 0 && (
                        <Badge className="ml-auto">
                          {Object.keys(previewImages).length} fornecedores com imagens
                        </Badge>
                      )}
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            {isProcessing && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Processando arquivos...</p>
                <Progress value={progress} className="w-full" />
              </div>
            )}
            
            {parsedSuppliers.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab('review')}>
                  Avançar para Revisão
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="review" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Revisar dados importados</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveTab('upload')}>Voltar</Button>
                {Object.keys(validationErrors).length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const csv = exportValidationErrorsToCSV(validationErrors);
                      downloadCSV(csv);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Exportar relatório de erro
                  </Button>
                )}
                <Button 
                  onClick={confirmImport}
                  disabled={
                    parsedSuppliers.length === 0 || 
                    Object.keys(validationErrors).length > 0 ||
                    isProcessing
                  }
                >
                  <Import className="mr-2 h-4 w-4" />
                  Confirmar importação
                </Button>
              </div>
            </div>
            
            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erros de validação</AlertTitle>
                <AlertDescription>
                  Existem {Object.keys(validationErrors).length} fornecedores com erros que precisam ser corrigidos.
                </AlertDescription>
              </Alert>
            )}
            
            {existingCategories.size === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>
                  Não há categorias cadastradas no sistema. Você precisa cadastrar categorias antes de importar fornecedores.
                </AlertDescription>
              </Alert>
            )}
            
            {isProcessing ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Importando fornecedores...</p>
                <Progress value={progress} className="w-full" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Imagens</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedSuppliers.map((supplier) => {
                      const hasErrors = validationErrors[supplier.codigo]?.length > 0;
                      const supplierImages = previewImages[supplier.codigo] || [];
                      const tipoArray = supplier.tipo_fornecedor?.split(',').map(t => t.trim()) || [];
                      
                      return (
                        <TableRow key={supplier.codigo} className={hasErrors ? "bg-red-50" : ""}>
                          <TableCell>{supplier.codigo}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{supplier.nome}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {supplier.descricao}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{supplier.cidade}/{supplier.estado}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {tipoArray.map((tipo, i) => (
                                <Badge key={i} variant="outline">
                                  {existingCategories.get(tipo) || tipo}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {supplierImages.length > 0 ? (
                              <div className="flex gap-1">
                                {supplierImages.slice(0, 3).map((img, i) => (
                                  <div 
                                    key={i}
                                    className="h-10 w-10 rounded-md overflow-hidden bg-gray-100"
                                  >
                                    <img 
                                      src={img} 
                                      alt={`${supplier.codigo}-${i}`} 
                                      className="h-full w-full object-cover" 
                                    />
                                  </div>
                                ))}
                                {supplierImages.length > 3 && (
                                  <Badge variant="secondary">+{supplierImages.length - 3}</Badge>
                                )}
                              </div>
                            ) : supplier.imagens ? (
                              <span className="text-amber-500 text-sm">Imagens listadas mas não encontradas no ZIP</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem imagens</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasErrors ? (
                              <div className="flex items-center">
                                <Badge variant="destructive" className="flex gap-1">
                                  <X className="h-3 w-3" />
                                  Com erros
                                </Badge>
                                <div className="ml-2 text-sm text-red-600">
                                  {validationErrors[supplier.codigo]?.[0]}
                                  {validationErrors[supplier.codigo]?.length > 1 && 
                                    ` (+${validationErrors[supplier.codigo]?.length - 1} mais)`}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 flex gap-1">
                                <Check className="h-3 w-3" />
                                Válido
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <h2 className="text-xl font-semibold">Histórico de importações</h2>
            
            {importHistory.length === 0 ? (
              <div className="p-8 text-center border rounded-md bg-gray-50">
                <History className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Ainda não há histórico de importações</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Arquivo</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {new Date(item.imported_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>{item.filename}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{item.total_count} fornecedores</span>
                            {item.error_count > 0 && (
                              <Badge variant="destructive">{item.error_count} erros</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.status === 'success' ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Sucesso
                            </Badge>
                          ) : item.status === 'error' ? (
                            <Badge variant="destructive">Erro</Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Database className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
