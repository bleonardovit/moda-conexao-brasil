import { supabase } from "@/integrations/supabase/client";
import { createSupplier } from "@/services/supplierService"; // Assuming updateSupplier might be used later
import type { Supplier } from "@/types"; // Assuming Supplier might be used later
import { SupplierFormValues } from "@/lib/validators/supplier-form";

// Interface for the parsed data from Excel
export interface SupplierRowData {
  codigo: string;
  nome: string;
  descricao: string;
  instagram?: string;
  whatsapp?: string;
  site?: string;
  preco_medio?: string;
  quantidade_minima?: string;
  cidade: string;
  estado: string;
  envio?: string;
  precisa_cnpj?: string;
  formas_pagamento?: string;
  tipo_fornecedor?: string;
  imagens?: string;
  originalRowIndex?: number; // Adicionado para rastrear a linha original do Excel
}

// Interface for validation errors
export interface ValidationErrors {
  [supplierCodeOrRowKey: string]: string[];
}

// Interface for import result
export interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: ValidationErrors;
}

// Helper function to normalize strings consistently
const normalizeString = (str: string | undefined | null): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Map Excel data to Supplier Form Values
export const mapRowToSupplierFormValues = (
  row: SupplierRowData,
  categoryNameToIdMap: Map<string, string> // NormalizedCategoryName -> CategoryID
): SupplierFormValues => {
  // Function to normalize strings (using the shared helper)
  const normalize = normalizeString;

  // Parse payment methods
  const paymentMethods: ('pix' | 'card' | 'bankslip')[] = [];
  if (row.formas_pagamento) {
    const methods = row.formas_pagamento.split(',').map(m => m.trim().toLowerCase());
    if (methods.some(m => normalize(m).includes('pix'))) paymentMethods.push('pix');
    if (methods.some(m => ['cartao', 'cartão', 'card'].some(term => normalize(m).includes(term)))) paymentMethods.push('card');
    if (methods.some(m => ['boleto', 'bankslip'].some(term => normalize(m).includes(term)))) paymentMethods.push('bankslip');
  }

  // Parse shipping methods
  const shippingMethods: ('correios' | 'delivery' | 'transporter' | 'excursion' | 'air' | 'custom')[] = [];
  if (row.envio) {
    const methods = row.envio.split(',').map(m => m.trim().toLowerCase());
    if (methods.some(m => normalize(m).includes('correios'))) shippingMethods.push('correios');
    if (methods.some(m => ['delivery', 'entrega'].some(term => normalize(m).includes(term)))) shippingMethods.push('delivery');
    if (methods.some(m => ['transporter', 'transportadora'].some(term => normalize(m).includes(term)))) shippingMethods.push('transporter');
    if (methods.some(m => ['excursion', 'excursao'].some(term => normalize(m).includes(term)))) shippingMethods.push('excursion');
    if (methods.some(m => ['air', 'aereo', 'aéreo'].some(term => normalize(m).includes(term)))) shippingMethods.push('air');
    if (methods.some(m => ['custom', 'outro'].some(term => normalize(m).includes(term)))) shippingMethods.push('custom');
  }

  // Parse avg price
  let avgPrice: 'low' | 'medium' | 'high' | undefined = undefined;
  if (row.preco_medio) {
    const price = normalize(row.preco_medio);
    if (['baixo', 'low', '1'].includes(price)) avgPrice = 'low';
    if (['medio', 'médio', 'medium', '2'].includes(price)) avgPrice = 'medium';
    if (['alto', 'high', '3'].includes(price)) avgPrice = 'high';
  }

  // Parse requires CNPJ
  const requiresCnpj = row.precisa_cnpj ? 
    ['sim', 'yes', 'true', '1'].includes(normalize(row.precisa_cnpj)) : false;

  // Parse categories: expects names from sheet, converts to IDs
  const categoryIds: string[] = [];
  if (row.tipo_fornecedor) {
    const namesFromSheet = row.tipo_fornecedor.split(',').map(c => c.trim()).filter(name => name);
    for (const name of namesFromSheet) {
      const normalizedName = normalize(name);
      const catId = categoryNameToIdMap.get(normalizedName);
      if (catId) {
        categoryIds.push(catId);
      } else {
        // This should ideally be caught by validateSupplierRow.
        // Logging here can help debug if validation consistency issues arise.
        console.warn(`[mapRowToSupplierFormValues] Nome da categoria "${name}" (normalizado: "${normalizedName}") não encontrado no mapa de categorias para o fornecedor ${row.codigo}. Categorias mapeadas: ${Array.from(categoryNameToIdMap.keys()).join(', ')}`);
      }
    }
  }

  return {
    code: row.codigo || '',
    name: row.nome || '',
    description: row.descricao || '',
    instagram: row.instagram || '',
    whatsapp: row.whatsapp || '',
    website: row.site || '',
    min_order: row.quantidade_minima || '',
    payment_methods: paymentMethods,
    requires_cnpj: requiresCnpj,
    avg_price: avgPrice,
    shipping_methods: shippingMethods,
    custom_shipping_method: '', // Assuming this is intentional or handled elsewhere
    city: row.cidade || '',
    state: row.estado || '',
    categories: categoryIds,
    featured: false, // Default value
    hidden: false,   // Default value
    images: [], // Will be filled later with image URLs
  };
};

// Validate a supplier row
export const validateSupplierRow = (
  row: SupplierRowData,
  existingCodes: Set<string>,
  categoryNameToIdMap: Map<string, string> // NormalizedCategoryName -> CategoryID
): string[] => {
  const errors: string[] = [];
  const normalize = normalizeString; // Use the shared helper

  // Check required fields
  if (!row.codigo || row.codigo.trim() === '') errors.push('Código é obrigatório');
  if (!row.nome || row.nome.trim() === '') errors.push('Nome é obrigatório');
  if (!row.descricao || row.descricao.trim() === '') errors.push('Descrição é obrigatória');
  if (!row.cidade || row.cidade.trim() === '') errors.push('Cidade é obrigatória');
  if (!row.estado || row.estado.trim() === '') errors.push('Estado é obrigatório');
  
  // Check code uniqueness
  if (row.codigo && existingCodes.has(row.codigo.trim())) {
    errors.push(`Código '${row.codigo}' já existe na base de dados`);
  }
  
  // Validate price
  if (row.preco_medio && row.preco_medio.trim() !== '') {
    const normalizedPrice = normalize(row.preco_medio);
    
    if (!['baixo', 'medio', 'alto', 'low', 'medium', 'high', '1', '2', '3'].includes(normalizedPrice)) {
      errors.push('Preço médio deve ser baixo, médio ou alto, ou um número de 1 a 3');
    }
  }
  
  // Validate categories by name
  if (row.tipo_fornecedor && row.tipo_fornecedor.trim() !== '') {
    const categoryNamesFromSheet = row.tipo_fornecedor.split(',').map(c => c.trim()).filter(name => name);
    if (categoryNamesFromSheet.length === 0 && row.tipo_fornecedor.trim() !== '') {
      // Handles cases like " , " which results in empty array after filter
      errors.push('Formato de categorias inválido. Use nomes de categorias separados por vírgula.');
    }
    for (const nameFromSheet of categoryNamesFromSheet) {
      const normalizedNameFromSheet = normalize(nameFromSheet);
      if (!categoryNameToIdMap.has(normalizedNameFromSheet)) {
        errors.push(`Categoria com nome '${nameFromSheet}' não foi encontrada.`);
      }
    }
  } else {
    errors.push('Pelo menos uma categoria deve ser informada. Forneça nomes de categorias separados por vírgula.');
  }
  
  console.log(`Validação do fornecedor ${row.codigo} (por nome de categoria): ${errors.length > 0 ? `${errors.length} erros` : 'válido'}`);
  if (errors.length > 0) {
    console.log(`Erros para ${row.codigo}:`, errors);
  }
  
  return errors;
};

// Import suppliers from parsed data
export const importSuppliers = async (
  suppliers: SupplierRowData[],
  imageMap: Record<string, string[]> = {},
  onProgress?: (progress: number) => void
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: true,
    successCount: 0,
    errorCount: 0,
    errors: {}
  };

  try {
    // Get existing supplier codes
    const { data: existingSuppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('code');

    if (fetchError) {
      console.error('Error fetching existing supplier codes:', fetchError);
      result.success = false;
      result.errors['global'] = [`Erro ao buscar códigos existentes: ${fetchError.message}`];
      return result;
    }
    
    const existingCodes = new Set((existingSuppliers || []).map(s => s.code));
    console.log('Códigos de fornecedores existentes:', Array.from(existingCodes));

    // Get existing categories to build the name-to-ID map
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Erro ao buscar categorias existentes:', categoriesError);
      result.success = false;
      result.errors['global'] = [`Erro ao buscar categorias: ${categoriesError.message}`];
      return result;
    }

    const categoryNameToIdMap = new Map<string, string>();
    (categoriesData || []).forEach(c => {
      if (c.id && c.name) {
        categoryNameToIdMap.set(normalizeString(c.name), c.id);
      }
    });
    console.log('Mapa NomeNormalizado->ID de Categoria construído em importSuppliers:', categoryNameToIdMap);

    // Validate all rows first using the categoryNameToIdMap
    for (const row of suppliers) {
      const errors = validateSupplierRow(row, existingCodes, categoryNameToIdMap);
      if (errors.length > 0) {
        result.errors[row.codigo || `unknown-${Date.now()}`] = errors;
        result.errorCount++;
      }
    }

    if (result.errorCount > 0) {
      result.success = false;
      console.log('Erros de validação encontrados antes da importação:', result.errors);
      return result;
    }

    // Import suppliers if validation passed
    let processed = 0;
    for (const row of suppliers) {
      const supplierCodeForError = row.codigo || `unknown-processing-${Date.now()}`;
      try {
        // Map Excel data, passing the categoryNameToIdMap
        const supplierData = mapRowToSupplierFormValues(row, categoryNameToIdMap);

        if (imageMap[row.codigo]) {
          supplierData.images = imageMap[row.codigo];
        }

        console.log(`Importando fornecedor ${supplierData.code} com IDs de categoria: ${supplierData.categories.join(', ')}`);
        await createSupplier(supplierData);
        result.successCount++;
        console.log(`Fornecedor ${supplierData.code} importado com sucesso!`);
      } catch (error) {
        console.error(`Erro ao importar fornecedor ${supplierCodeForError}:`, error);
        result.errors[supplierCodeForError] = [
          `Erro ao importar: ${error instanceof Error ? error.message : 'erro desconhecido'}`
        ];
        result.errorCount++;
        result.success = false;
      }

      processed++;
      if (onProgress) {
        onProgress(Math.floor((processed / suppliers.length) * 100));
      }
    }

    return result;
  } catch (error) {
    console.error('Erro no processo de importação em massa:', error);
    result.success = false;
    result.errors['global'] = [
      `Erro no processo de importação: ${error instanceof Error ? error.message : 'erro desconhecido'}`
    ];
    return result;
  }
};

// Process and upload images from a ZIP file
export const processImagesFromZip = async (
  zipData: ArrayBuffer, 
  storagePath = 'supplier-images'
): Promise<Record<string, string[]>> => {
  const JSZip = await import('jszip').then(mod => mod.default);
  const zip = await JSZip.loadAsync(zipData);
  
  const imageMap: Record<string, string[]> = {};
  const processingPromises: Promise<void>[] = [];

  for (const filename of Object.keys(zip.files)) {
    const fileInZip = zip.files[filename];
    if (fileInZip.dir || !/\.(jpe?g|png|gif|webp)$/i.test(filename)) {
      continue;
    }

    const processingPromise = (async () => {
      // Extract code from filename (e.g., F001-img1.jpg -> F001)
      const match = filename.match(/^([^-]+)-/) || filename.match(/^([^.]+)\./); // More flexible match
      const supplierCode = match ? match[1] : null;
      
      if (!supplierCode) {
        console.warn(`Could not extract supplier code from image filename: ${filename}`);
        return;
      }
      
      try {
        const blob = await fileInZip.async("blob");
        const fileExt = filename.split('.').pop() || 'jpg'; // Default extension
        const uniqueFileName = `${supplierCode}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(storagePath)
          .upload(uniqueFileName, blob, {
            contentType: blob.type,
            upsert: false // Set to false to avoid accidental overwrites if not intended
          });
        
        if (uploadError) {
          console.error(`Error uploading ${filename} (for ${supplierCode}):`, uploadError);
          // Optionally, collect these errors to show to the user
          return;
        }
        
        if (uploadData?.path) {
            const { data: urlData } = supabase.storage
            .from(storagePath)
            .getPublicUrl(uploadData.path);
        
            if (urlData && urlData.publicUrl) {
                if (!imageMap[supplierCode]) {
                imageMap[supplierCode] = [];
                }
                imageMap[supplierCode].push(urlData.publicUrl);
            } else {
                console.warn(`Could not get public URL for uploaded image: ${filename}`);
            }
        } else {
            console.warn(`Upload data path missing for ${filename}`);
        }

      } catch (error) {
        console.error(`Error processing image ${filename} from ZIP:`, error);
      }
    })();
    processingPromises.push(processingPromise);
  }
  
  await Promise.all(processingPromises);
  return imageMap;
};

// Define a interface explícita para os dados do histórico de importação
// Estes nomes devem corresponder às colunas na tabela supplier_import_history do Supabase
export interface SupplierImportHistoryEntry {
  id: string; 
  file_name: string;
  imported_by_id?: string | null;
  imported_at: string; 
  status: 'success' | 'error' | 'pending' | 'partial';
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_details?: ValidationErrors | { global?: string[] };
  // Adicione quaisquer outros campos que existam na sua tabela, ex: created_at (gerado pelo DB)
  // created_at?: string;
}

export const saveImportHistory = async (historyData: SupplierImportHistoryEntry) => {
  console.log('[saveImportHistory] Saving history data:', JSON.stringify(historyData, null, 2));

  // Supabase insert espera que as chaves do objeto correspondam aos nomes das colunas.
  // Se o linter reclamar sobre 'filename' vs 'file_name', ou 'total_count' vs 'total_rows',
  // significa que os tipos inferidos/gerados pelo Supabase para a tabela 'supplier_import_history'
  // usam nomes diferentes. A solução ideal é alinhar esta interface com os tipos gerados do Supabase
  // ou fazer um mapeamento explícito aqui.
  
  // Tentativa direta, assumindo que SupplierImportHistoryEntry está alinhada com as colunas da tabela:
  const { data, error } = await supabase
    .from('supplier_import_history') 
    .insert([historyData]); 

  if (error) {
    console.error("Erro ao salvar histórico de importação:", error);
    // Exemplo de como o linter pode ter inferido os tipos das colunas:
    // console.error("Supabase SDK might expect fields like: filename, total_count, success_count, error_count, imported_by");
  }
  return { data, error };
};

// Função para buscar o histórico de importações
export const fetchImportHistoryFromService = async (limit = 20): Promise<SupplierImportHistoryEntry[]> => {
  const { data, error } = await supabase
    .from('supplier_import_history')
    .select('*') 
    .order('imported_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Erro ao buscar histórico de importação (service):", error);
    return []; // Retorna array vazio em caso de erro
  }
  
  // O cast para SupplierImportHistoryEntry[] assume que os dados retornados pelo Supabase
  // (com os nomes exatos das colunas) são compatíveis. 
  // Se houver incompatibilidade (ex: total_count vs total_rows), um mapeamento seria necessário:
  // return (data || []).map(item => ({ ...item, total_rows: item.total_count, ... })) as SupplierImportHistoryEntry[];
  return (data || []) as SupplierImportHistoryEntry[]; 
};
