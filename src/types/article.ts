
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
