
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SuppliersList from './pages/suppliers/SuppliersList';
import SupplierDetails from './pages/suppliers/SupplierDetail'; // Fixed extension from SupplierDetails to SupplierDetail
import SuppliersManagement from './pages/admin/SuppliersManagement';
import SuppliersBulkUpload from './pages/admin/SuppliersBulkUpload';
import Dashboard from './pages/admin/Dashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fornecedores" element={<SuppliersList />} />
        <Route path="/fornecedores/:id" element={<SupplierDetails />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/suppliers" element={<SuppliersManagement />} />
        <Route path="/admin/suppliers/bulk-upload" element={<SuppliersBulkUpload />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
