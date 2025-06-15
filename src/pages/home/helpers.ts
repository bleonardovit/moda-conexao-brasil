
import { Category } from '@/types';

export const getCategoryName = (allCategories: Category[], categoryId: string): string => {
  const foundCategory = allCategories.find(cat => cat.id === categoryId);
  return foundCategory ? foundCategory.name : categoryId;
};

export const getCategoryStyle = (_categoryName: string): string => {
  // Simples para manter compatibilidade, pode ser expandido depois.
  return "bg-white/10";
};

export const formatAvgPrice = (price: string): string => {
  const priceMap = {
    'low': 'Baixo',
    'medium': 'Médio',
    'high': 'Alto'
  };
  return priceMap[price as keyof typeof priceMap] || price;
};
