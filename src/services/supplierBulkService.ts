
import { supabase } from "@/integrations/supabase/client";
import { createSupplier, updateSupplier } from "@/services/supplierService";
import type { Supplier } from "@/types";
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
}

// Interface for validation errors
export interface ValidationErrors {
  [supplierCode: string]: string[];
}

// Interface for import result
export interface ImportResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: ValidationErrors;
}

// Map Excel data to Supplier Form Values
export const mapRowToSupplierFormValues = (row: SupplierRowData): SupplierFormValues => {
  // Function to normalize strings
  const normalize = (str: string) => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

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

  // Parse categories
  const categories = row.tipo_fornecedor ? 
    row.tipo_fornecedor.split(',').map(c => c.trim()) : [];

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
    categories: categories,
    featured: false, // Default value
    hidden: false,   // Default value
    images: [], // Will be filled later with image URLs
  };
};

// Validate a supplier row
export const validateSupplierRow = (
  row: SupplierRowData, 
  existingCodes: Set<string>,
  existingCategories: Map<string, string>
): string[] => {
  const errors: string[] = [];
  
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
    const normalize = (str: string) => {
      return (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };
    
    const normalizedPrice = normalize(row.preco_medio);
    
    if (!['baixo', 'medio', 'alto', 'low', 'medium', 'high', '1', '2', '3'].includes(normalizedPrice)) {
      errors.push('Preço médio deve ser baixo, médio ou alto, ou um número de 1 a 3');
    }
  }
  
  // Validate categories
  if (row.tipo_fornecedor && row.tipo_fornecedor.trim() !== '') {
    const categoryIds = row.tipo_fornecedor.split(',').map(c => c.trim());
    for (const catId of categoryIds) {
      if (catId && !existingCategories.has(catId)) {
        errors.push(`Categoria com ID '${catId}' não foi encontrada`);
      }
    }
  } else {
    errors.push('Pelo menos uma categoria deve ser informada');
  }
  
  console.log(`Validação do fornecedor ${row.codigo}: ${errors.length > 0 ? `${errors.length} erros` : 'válido'}`);
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
    // Get existing supplier codes to check for duplicates
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
    console.log('Códigos existentes:', Array.from(existingCodes));
    
    // Get existing categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (categoriesError) {
      console.error('Error fetching existing categories:', categoriesError);
      result.success = false;
      result.errors['global'] = [`Erro ao buscar categorias existentes: ${categoriesError.message}`];
      return result;
    }
    
    const existingCategories = new Map(
      (categoriesData || []).map(c => [c.id, c.name])
    );
    console.log('Categorias existentes:', Array.from(existingCategories.keys()));
    
    // Validate all rows first
    for (const row of suppliers) {
      const errors = validateSupplierRow(row, existingCodes, existingCategories);
      if (errors.length > 0) {
        result.errors[row.codigo || `unknown-${Date.now()}`] = errors; // Ensure unique key for errors
        result.errorCount++;
      }
    }
    
    // If there are validation errors, stop here
    if (result.errorCount > 0) {
      result.success = false;
      return result;
    }
    
    // Import suppliers if validation passed
    let processed = 0;
    
    for (const row of suppliers) {
      const supplierCodeForError = row.codigo || `unknown-processing-${Date.now()}`;
      try {
        // Map Excel data to supplier format
        const supplierData = mapRowToSupplierFormValues(row);
        
        // Add images if available
        if (imageMap[row.codigo]) {
          supplierData.images = imageMap[row.codigo];
        }
        
        console.log(`Importing supplier ${supplierData.code}...`);
        
        // Create supplier in database
        // Assuming createSupplier handles its own errors or throws them
        await createSupplier(supplierData); 
        
        result.successCount++;
        console.log(`Supplier ${supplierData.code} imported successfully!`);
      } catch (error) {
        console.error(`Error importing supplier ${supplierCodeForError}:`, error);
        result.errors[supplierCodeForError] = [
          `Erro ao importar: ${error instanceof Error ? error.message : 'erro desconhecido'}`
        ];
        result.errorCount++;
        result.success = false; // Mark overall success as false if any supplier fails
      }
      
      processed++;
      if (onProgress) {
        onProgress(Math.floor((processed / suppliers.length) * 100));
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in bulk import process:', error);
    result.success = false;
    result.errors['global'] = [ // Ensure 'global' errors are captured
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

// Save import history
export const saveImportHistory = async (historyData: {
  filename: string;
  total_count: number;
  success_count: number;
  error_count: number;
  status: 'success' | 'error' | 'pending';
  error_details?: ValidationErrors;
}) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    // Not critical if user fetch fails, imported_by is nullable
    if (userError) {
      console.warn('Error fetching user for import history:', userError.message);
    }

    console.log('Saving import history with user:', userData?.user?.id || 'null');
    console.log('Import history data:', historyData);

    const { data, error } = await supabase
      .from('supplier_import_history')
      .insert({
        filename: historyData.filename,
        total_count: historyData.total_count,
        success_count: historyData.success_count,
        error_count: historyData.error_count,
        status: historyData.status,
        imported_by: userData?.user?.id || null,
        imported_at: new Date().toISOString(),
        error_details: historyData.error_details || null // Ensure null if undefined
      })
      .select()
      .single(); 
    
    if (error) {
      console.error('Error saving import history:', error);
      // Specific RLS check
      if (error.message.includes("violates row-level security policy")) {
        console.error("RLS policy violation when saving import history. Ensure the user has permissions or table policy allows insert.");
      }
      throw error; // Re-throw for proper handling by caller
    }
    
    console.log('Import history saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error in saveImportHistory:', error);
    throw error; // Re-throw for proper handling by caller
  }
};
