
// Main supplier service - re-exports all supplier-related functionality
export * from './supplier/types';
export * from './supplier/mapper';
export * from './supplier/categories';

// Export queries
export {
  fetchSuppliers,
  getSuppliers,
  searchSuppliers,
  getDistinctStates,
  getDistinctCities,
  getSupplierById
} from './supplier/queries';

// Export mutations
export {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierFeatured,
  toggleSupplierVisibility,
  updateSupplierFeaturedStatus,
  updateSupplierHiddenStatus
} from './supplier/mutations';
