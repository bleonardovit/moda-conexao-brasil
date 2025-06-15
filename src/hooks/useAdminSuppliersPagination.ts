
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedAdminSuppliers } from '@/services/supplier/optimizedAdminQueries';
import { useOptimizedCache } from './useOptimizedCache';
import type { Supplier } from '@/types';

interface AdminFilters {
  searchTerm?: string;
  hiddenFilter?: 'all' | 'visible' | 'hidden';
  featuredFilter?: 'all' | 'featured' | 'normal';
}

interface UseAdminSuppliersPaginationProps {
  initialPageSize?: number;
}

export function useAdminSuppliersPagination({ 
  initialPageSize = 25 
}: UseAdminSuppliersPaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'normal'>('all');
  
  const { invalidate } = useOptimizedCache();
  
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [hiddenFilter, featuredFilter, pageSize]);

  const filters: AdminFilters = useMemo(() => ({
    searchTerm: debouncedSearchTerm || undefined,
    hiddenFilter,
    featuredFilter,
  }), [debouncedSearchTerm, hiddenFilter, featuredFilter]);

  const offset = (currentPage - 1) * pageSize;

  console.log('useAdminSuppliersPagination: Current state:', {
    currentPage,
    pageSize,
    offset,
    filters
  });

  const {
    data,
    isLoading,
    error,
    refetch: originalRefetch
  } = useQuery({
    queryKey: ['admin-suppliers-optimized', currentPage, pageSize, filters],
    queryFn: async () => {
      const startTime = performance.now();
      const result = await getOptimizedAdminSuppliers(offset, pageSize, filters);
      const duration = performance.now() - startTime;
      
      console.log(`Admin suppliers query took ${duration.toFixed(2)}ms`);
      
      return result;
    },
    staleTime: 30000, // 30 seconds cache
    gcTime: 60000, // 1 minute in memory
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      
      // Não retry em erros de UUID
      if (error.message.includes('invalid input syntax for type uuid')) {
        console.error('UUID error in admin query:', error);
        return false;
      }
      
      return true;
    }
  });

  const suppliers = data?.suppliers || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  console.log('useAdminSuppliersPagination: Query result:', {
    suppliersCount: suppliers.length,
    totalCount,
    totalPages,
    hasMore,
    currentPage
  });

  const handlePageChange = (page: number) => {
    console.log('useAdminSuppliersPagination: Changing to page', page);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    console.log('useAdminSuppliersPagination: Changing page size to', newPageSize);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setHiddenFilter('all');
    setFeaturedFilter('all');
    setCurrentPage(1);
  };

  // Refetch otimizado que limpa caches relacionados
  const refetch = async () => {
    invalidate('admin-suppliers');
    invalidate('suppliers');
    return originalRefetch();
  };

  return {
    // Data
    suppliers,
    totalCount,
    hasMore,
    totalPages,
    
    // Pagination state
    currentPage,
    pageSize,
    
    // Filters
    searchTerm,
    hiddenFilter,
    featuredFilter,
    
    // Loading state
    isLoading,
    error,
    
    // Actions
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    setHiddenFilter,
    setFeaturedFilter,
    clearFilters,
    refetch,
  };
}
