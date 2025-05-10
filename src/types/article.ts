
export type ArticleCategory = {
  id: string;
  label: string;
  color: string;
  created_at?: string;
  updated_at?: string;
};

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  created_at: string;
  image_url?: string;
  published: boolean;
  updated_at?: string;
}

// Função auxiliar para obter o label de uma categoria
export function getCategoryLabel(categoryId: string, categories: ArticleCategory[]): string {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.label : categoryId;
}

// Função auxiliar para obter as cores de uma categoria
export function getCategoryColors(categoryId: string, categories: ArticleCategory[]): string {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.color : 'bg-gray-100 text-gray-800';
}

// Default categories array for use in components
export const DEFAULT_CATEGORIES: ArticleCategory[] = [
  { id: 'traffic', label: 'Tráfego Pago', color: 'bg-blue-100 text-blue-800' },
  { id: 'instagram', label: 'Instagram', color: 'bg-purple-100 text-purple-800' },
  { id: 'entrepreneurship', label: 'Empreendedorismo', color: 'bg-green-100 text-green-800' },
  { id: 'marketing', label: 'Marketing Digital', color: 'bg-pink-100 text-pink-800' },
  { id: 'finance', label: 'Finanças', color: 'bg-amber-100 text-amber-800' },
  { id: 'management', label: 'Gestão', color: 'bg-cyan-100 text-cyan-800' }
];
