import { useState, useRef } from 'react';
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
  Import
} from 'lucide-react';
import { Supplier } from '@/types';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

// Template para download
const TEMPLATE_HEADERS = [
  'Código', 'Nome', 'Descrição', 'Instagram', 'WhatsApp', 'Site', 
  'Preço médio (baixo/médio/alto)', 'Condições de compra', 'Cidade', 'Estado',
  'Envio (correios,transportadora,entrega)', 'Precisa de CNPJ (sim/não)', 
  'Quantidade mínima', 'Formas de pagamento (pix,cartão,boleto)', 
  'Tipo de fornecedor (categorias separadas por vírgula)', 'Avaliação (1-5)',
  'Nomes das imagens (separadas por vírgula)'
];

// Interface para os dados da planilha
interface SupplierRow {
  codigo: string;
  nome: string;
  descricao: string;
  instagram?: string;
  whatsapp?: string;
  site?: string;
  preco_medio: string;
  condicoes_compra?: string;
  cidade: string;
  estado: string;
  envio: string;
  precisa_cnpj: string;
  quantidade_minima?: string;
  formas_pagamento: string;
  tipo_fornecedor: string;
  avaliacao?: string;
  imagens?: string;
}

// Interface para o histórico de importações
interface ImportHistory {
  id: string;
  date: string;
  filename: string;
  status: 'success' | 'error' | 'pending';
  totalSuppliers: number;
  successCount: number;
  errorCount: number;
}

// Componente para a página de upload em massa
export default function SuppliersBulkUpload() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'upload' | 'review' | 'history'>('upload');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [parsedSuppliers, setParsedSuppliers] = useState<SupplierRow[]>([]);
  const [previewImages, setPreviewImages] = useState<Record<string, string[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Processar arquivo Excel/CSV
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setExcelFile(file);
    setProgress(0);
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Ignore a primeira linha (cabeçalhos)
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      // Mapear dados para o formato esperado
      const suppliers: SupplierRow[] = rows.map(row => {
        const supplier: any = {};
        headers.forEach((header: string, index: number) => {
          const normalizedHeader = header
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '_');
          
          supplier[normalizedHeader] = row[index] || '';
        });
        return supplier as SupplierRow;
      });
      
      setParsedSuppliers(suppliers);
      validateSuppliers(suppliers);
      
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
  
  // Processar arquivo ZIP com imagens
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
      
      // Processar cada arquivo no ZIP
      const promises = Object.keys(zip.files).map(async (filename) => {
        if (zip.files[filename].dir) return;
        
        // Verificar se é uma imagem
        if (!/\.(jpe?g|png|gif|webp)$/i.test(filename)) return;
        
        // Extrair código do fornecedor do nome do arquivo (F001-img1.jpg -> F001)
        const match = filename.match(/^([^-]+)-/) || [null, filename.split('.')[0]];
        const supplierCode = match[1];
        
        if (!supplierCode) return;
        
        // Ler o arquivo como blob
        const blob = await zip.files[filename].async("blob");
        const imageUrl = URL.createObjectURL(blob);
        
        // Adicionar à lista de imagens por fornecedor
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
      
      // Validar correspondência entre imagens e fornecedores
      if (parsedSuppliers.length > 0) {
        validateSuppliers(parsedSuppliers, images);
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
  
  // Validar dados dos fornecedores
  const validateSuppliers = (suppliers: SupplierRow[], images: Record<string, string[]> = previewImages) => {
    const errors: Record<string, string[]> = {};
    
    suppliers.forEach(supplier => {
      const supplierErrors: string[] = [];
      
      // Verificar campos obrigatórios
      if (!supplier.codigo) supplierErrors.push('Código é obrigatório');
      if (!supplier.nome) supplierErrors.push('Nome é obrigatório');
      if (!supplier.descricao) supplierErrors.push('Descrição é obrigatória');
      if (!supplier.cidade) supplierErrors.push('Cidade é obrigatória');
      if (!supplier.estado) supplierErrors.push('Estado é obrigatório');
      
      // Validar preço médio
      if (!['baixo', 'medio', 'alto', 'low', 'medium', 'high'].includes(normalize(supplier.preco_medio))) {
        supplierErrors.push('Preço médio deve ser baixo, médio ou alto');
      }
      
      // Validar formas de envio
      const envioArray = supplier.envio?.split(',').map(v => normalize(v.trim()));
      if (!envioArray?.some(v => ['correios', 'transportadora', 'entrega'].includes(v))) {
        supplierErrors.push('Envio deve incluir correios, transportadora e/ou entrega');
      }
      
      // Validar formas de pagamento
      const pagamentoArray = supplier.formas_pagamento?.split(',').map(v => normalize(v.trim()));
      if (!pagamentoArray?.some(v => ['pix', 'cartao', 'cartão', 'boleto'].includes(v))) {
        supplierErrors.push('Formas de pagamento deve incluir pix, cartão e/ou boleto');
      }
      
      // Verificar imagens
      if (supplier.imagens && Object.keys(images).length > 0) {
        const expectedImages = supplier.imagens.split(',').map(img => img.trim());
        const actualImages = images[supplier.codigo] || [];
        
        if (expectedImages.length > 0 && actualImages.length === 0) {
          supplierErrors.push('Imagens mencionadas não foram encontradas no ZIP');
        }
      }
      
      if (supplierErrors.length > 0) {
        errors[supplier.codigo] = supplierErrors;
      }
    });
    
    setValidationErrors(errors);
    return errors;
  };
  
  // Função utilitária para exportar erros em CSV
  function exportValidationErrorsToCSV(errors) {
    if (!errors || !Object.keys(errors).length) return '';
    const header = 'Linha,Código,Erro';
    const lines = Object.entries(errors).flatMap(([codigo, msgs]) =>
      (Array.isArray(msgs) ? msgs : []).map(msg => `${codigo},${msg.replace(/"/g, '""')}`)
    );
    return [header, ...lines].join('\n');
  }

  function downloadCSV(csvContent, filename = 'erros_importacao.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Confirmar importação
  const confirmImport = () => {
    // Verificar se há erros de validação
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
    
    // Simular progresso
    const totalSteps = parsedSuppliers.length;
    let currentStep = 0;
    
    const processInterval = setInterval(() => {
      currentStep++;
      setProgress(Math.floor((currentStep / totalSteps) * 100));
      
      if (currentStep >= totalSteps) {
        clearInterval(processInterval);
        finishImport();
      }
    }, 50);
  };
  
  // Finalizar importação
  const finishImport = () => {
    // Em um cenário real, aqui você salvaria os dados no banco de dados
    // Aqui estamos apenas simulando o processo
    
    // Adicionar ao histórico
    const newImport: ImportHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      filename: excelFile?.name || 'import.xlsx',
      status: 'success',
      totalSuppliers: parsedSuppliers.length,
      successCount: parsedSuppliers.length,
      errorCount: 0
    };
    
    setImportHistory([newImport, ...importHistory]);
    
    setIsProcessing(false);
    setProgress(100);
    
    // Limpar dados
    setParsedSuppliers([]);
    setPreviewImages({});
    setExcelFile(null);
    setZipFile(null);
    
    if (excelInputRef.current) excelInputRef.current.value = '';
    if (zipInputRef.current) zipInputRef.current.value = '';
    
    toast({
      title: "Importação concluída com sucesso",
      description: `${parsedSuppliers.length} fornecedores foram importados.`
    });
    
    // Mover para a aba de histórico
    setActiveTab('history');
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
                  <Button variant="outline" onClick={() => {
                    const csv = exportValidationErrorsToCSV(validationErrors);
                    downloadCSV(csv);
                  }}>
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
                <AlertTitle>Erros de validação</AlertTitle>
                <AlertDescription>
                  Existem {Object.keys(validationErrors).length} fornecedores com erros que precisam ser corrigidos.
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
                                <Badge key={i} variant="outline">{tipo}</Badge>
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
                          {new Date(item.date).toLocaleDateString('pt-BR', {
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
                            <span>{item.totalSuppliers} fornecedores</span>
                            {item.errorCount > 0 && (
                              <Badge variant="destructive">{item.errorCount} erros</Badge>
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
