
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
