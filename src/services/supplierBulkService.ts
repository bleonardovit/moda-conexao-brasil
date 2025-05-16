
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
    custom_shipping_method: '',
    city: row.cidade || '',
    state: row.estado || '',
    categories: categories,
    featured: false,
    hidden: false,
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
  if (!row.codigo) errors.push('Código é obrigatório');
  if (!row.nome) errors.push('Nome é obrigatório');
  if (!row.descricao) errors.push('Descrição é obrigatória');
  if (!row.cidade) errors.push('Cidade é obrigatória');
  if (!row.estado) errors.push('Estado é obrigatório');
  
  // Check code uniqueness
  if (row.codigo && existingCodes.has(row.codigo)) {
    errors.push(`Código '${row.codigo}' já existe na base de dados`);
  }
  
  // Validate price
  if (row.preco_medio) {
    const normalizedPrice = row.preco_medio
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (!['baixo', 'medio', 'alto', 'low', 'medium', 'high', '1', '2', '3'].includes(normalizedPrice)) {
      errors.push('Preço médio deve ser baixo, médio ou alto');
    }
  }
  
  // Validate categories
  if (row.tipo_fornecedor) {
    const categoryIds = row.tipo_fornecedor.split(',').map(c => c.trim());
    for (const catId of categoryIds) {
      if (!existingCategories.has(catId)) {
        errors.push(`Categoria com ID '${catId}' não foi encontrada`);
      }
    }
  } else {
    errors.push('Pelo menos uma categoria deve ser informada');
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
    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('code');
    
    const existingCodes = new Set((existingSuppliers || []).map(s => s.code));
    
    // Get existing categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, name');
    
    const existingCategories = new Map(
      (categoriesData || []).map(c => [c.id, c.name])
    );
    
    // Validate all rows first
    for (const row of suppliers) {
      const errors = validateSupplierRow(row, existingCodes, existingCategories);
      if (errors.length > 0) {
        result.errors[row.codigo || 'unknown'] = errors;
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
      try {
        // Map Excel data to supplier format
        const supplierData = mapRowToSupplierFormValues(row);
        
        // Add images if available
        if (imageMap[row.codigo]) {
          supplierData.images = imageMap[row.codigo];
        }
        
        // Create supplier in database
        await createSupplier(supplierData);
        
        result.successCount++;
      } catch (error) {
        console.error(`Error importing supplier ${row.codigo}:`, error);
        result.errors[row.codigo || 'unknown'] = [
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
    console.error('Error in bulk import process:', error);
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
  // Import JSZip dynamically (already installed in the project)
  const JSZip = await import('jszip').then(mod => mod.default);
  const zip = await JSZip.loadAsync(zipData);
  
  const imageMap: Record<string, string[]> = {};
  
  // Process each file in the ZIP
  const promises = Object.keys(zip.files).map(async (filename) => {
    if (zip.files[filename].dir) return;
    
    // Check if it's an image file
    if (!/\.(jpe?g|png|gif|webp)$/i.test(filename)) return;
    
    // Extract code from filename (e.g., F001-img1.jpg -> F001)
    const match = filename.match(/^([^-]+)-/) || [null, filename.split('.')[0]];
    const supplierCode = match[1];
    
    if (!supplierCode) return;
    
    // Get the file as blob
    const blob = await zip.files[filename].async("blob");
    
    // Upload to Supabase Storage
    const fileExt = filename.split('.').pop();
    const filePath = `${supplierCode}/${Date.now()}.${fileExt}`;
    
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(storagePath)
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Error uploading ${filename}:`, uploadError);
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(storagePath)
        .getPublicUrl(filePath);
      
      if (urlData && urlData.publicUrl) {
        // Add to image map
        if (!imageMap[supplierCode]) {
          imageMap[supplierCode] = [];
        }
        imageMap[supplierCode].push(urlData.publicUrl);
      }
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  });
  
  await Promise.all(promises);
  return imageMap;
};

// Save import history
export const saveImportHistory = async (historyData: {
  filename: string;
  totalSuppliers: number;
  successCount: number;
  errorCount: number;
  status: 'success' | 'error' | 'pending';
}) => {
  try {
    const { data, error } = await supabase
      .from('supplier_import_history')
      .insert({
        filename: historyData.filename,
        total_count: historyData.totalSuppliers,
        success_count: historyData.successCount,
        error_count: historyData.errorCount,
        status: historyData.status,
        imported_by: (await supabase.auth.getUser()).data.user?.id,
        imported_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving import history:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveImportHistory:', error);
    return null;
  }
};
