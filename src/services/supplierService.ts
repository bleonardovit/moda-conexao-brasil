
// Main supplier service - re-exports all supplier-related functionality
export * from './supplier/queries';
export * from './supplier/categories';
export * from './supplier/types';
export * from './supplier/mapper';
// Export mutations separately to avoid conflicts
export { 
  createSupplier as createSupplierMutation,
  updateSupplier as updateSupplierMutation,
  deleteSupplier as deleteSupplierMutation
} from './supplier/mutations';
