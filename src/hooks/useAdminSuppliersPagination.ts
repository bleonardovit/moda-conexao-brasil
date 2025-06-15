
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedAdminSuppliers } from '@/services/supplier/optimizedAdminQueries';
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

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-suppliers-paginated', currentPage, pageSize, filters],
    queryFn: () => getOptimizedAdminSuppliers(offset, pageSize, filters),
    staleTime: 30000, // 30 seconds cache
    refetchOnWindowFocus: false,
  });

  const suppliers = data?.suppliers || [];
  const totalCount = data?.totalCount || 0;
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
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
