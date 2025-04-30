
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout/AppLayout';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">Pesquisar</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar fornecedores, produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {searchTerm ? (
            <div className="mt-6">
              <p className="text-muted-foreground">Resultados para "{searchTerm}"</p>
              <div className="mt-4 rounded-md border border-border p-8 text-center">
                <p className="text-muted-foreground">Nenhum resultado encontrado</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-md border border-border p-8 text-center">
              <p className="text-muted-foreground">Digite algo para pesquisar</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
