
import { AppLayout } from '@/components/layout/AppLayout';
import { TrialProvider } from '@/contexts/TrialContext';
import { SuppliersListView } from '@/components/suppliers/SuppliersListView';

export default function SuppliersList() {
  return (
    <AppLayout>
      <TrialProvider>
        <SuppliersListView />
      </TrialProvider>
    </AppLayout>
  );
}
