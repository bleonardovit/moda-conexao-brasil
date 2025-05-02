
export type ArticleCategory = 
  | 'traffic' 
  | 'instagram' 
  | 'entrepreneurship' 
  | 'marketing' 
  | 'finance' 
  | 'management';

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

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  traffic: 'Tráfego Pago',
  instagram: 'Instagram',
  entrepreneurship: 'Empreendedorismo',
  marketing: 'Marketing Digital',
  finance: 'Finanças',
  management: 'Gestão'
};

// Cores para as categorias (para indicadores visuais)
export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  traffic: 'bg-blue-100 text-blue-800',
  instagram: 'bg-purple-100 text-purple-800',
  entrepreneurship: 'bg-green-100 text-green-800',
  marketing: 'bg-pink-100 text-pink-800',
  finance: 'bg-amber-100 text-amber-800',
  management: 'bg-cyan-100 text-cyan-800'
};
