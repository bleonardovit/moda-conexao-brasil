
import { DefaultOptions } from '@tanstack/react-query';

// Configuração global do React Query para otimizar o caching
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Otimizações globais para todas as queries
    staleTime: 3 * 60 * 1000, // 3 minutos por padrão
    gcTime: 10 * 60 * 1000, // 10 minutos de cache (atualizado de cacheTime para gcTime)
    refetchOnWindowFocus: true, // Recarregar ao voltar para a janela
    refetchOnReconnect: true, // Recarregar quando reconectar à internet
    retry: 1, // Limitar retentativas para reduzir requisições extras
  },
};

// Exportando função utilitária para identificar e lidar com erros de rede
export const isNetworkError = (error: any): boolean => {
  return !window.navigator.onLine || 
    error?.message?.includes('network') || 
    error?.message?.includes('Failed to fetch');
};

// Configuração de debounce para múltiplos refetches
// Isso evita que várias requisições sejam feitas ao mesmo tempo
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...funcArgs: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
