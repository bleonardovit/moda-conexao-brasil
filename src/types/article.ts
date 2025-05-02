
export type ArticleCategory = string;

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  author: string;
  created_at: string;
  image_url?: string;
}

export interface CategoryDefinition {
  id: ArticleCategory;
  label: string;
  color: string;
}

// Sistema de categorias que pode ser modificado dinamicamente
export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'traffic', label: 'Tráfego Pago', color: 'bg-blue-100 text-blue-800' },
  { id: 'instagram', label: 'Instagram', color: 'bg-purple-100 text-purple-800' },
  { id: 'entrepreneurship', label: 'Empreendedorismo', color: 'bg-green-100 text-green-800' },
  { id: 'marketing', label: 'Marketing Digital', color: 'bg-pink-100 text-pink-800' },
  { id: 'finance', label: 'Finanças', color: 'bg-amber-100 text-amber-800' },
  { id: 'management', label: 'Gestão', color: 'bg-cyan-100 text-cyan-800' }
];

// Função auxiliar para obter o label de uma categoria
export function getCategoryLabel(categoryId: ArticleCategory, categories: CategoryDefinition[]): string {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.label : categoryId;
}

// Função auxiliar para obter as cores de uma categoria
export function getCategoryColors(categoryId: ArticleCategory, categories: CategoryDefinition[]): string {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.color : 'bg-gray-100 text-gray-800';
}
