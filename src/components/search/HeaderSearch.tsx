
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { fetchSuppliers } from '@/services/supplierService';
import { getArticles } from '@/services/articleService';
import { Supplier } from '@/types/supplier';

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const navigate = useNavigate();

  // Fetch suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error('Error loading suppliers for search:', error);
      }
    };
    
    loadSuppliers();
  }, []);

  // Busca dinâmica
  const filteredSuppliers = useMemo(() => {
    if (!query) return [];
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(query.toLowerCase()) ||
      supplier.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, suppliers]);

  const filteredArticles = useMemo(() => {
    if (!query) return [];
    return getArticles().filter(article =>
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.summary.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  // Handle command selection
  const handleSelect = (value: string) => {
    setOpen(false);
    navigate(value);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Buscar</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar fornecedores, artigos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {query ? (
            <>
              {filteredSuppliers.length > 0 && (
                <CommandGroup heading="Fornecedores">
                  {filteredSuppliers.map(supplier => (
                    <CommandItem
                      key={supplier.id}
                      value={`/suppliers/${supplier.id}`}
                      onSelect={() => handleSelect(`/suppliers/${supplier.id}`)}
                    >
                      <span className="font-medium">{supplier.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{supplier.city} - {supplier.state}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {filteredArticles.length > 0 && (
                <CommandGroup heading="Artigos">
                  {filteredArticles.map(article => (
                    <CommandItem
                      key={article.id}
                      value={`/articles/${article.id}`}
                      onSelect={() => handleSelect(`/articles/${article.id}`)}
                    >
                      <span className="font-medium">{article.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{article.category}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          ) : (
            <CommandGroup heading="Sugestões">
              <CommandItem value="/suppliers" onSelect={handleSelect}>
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar todos os fornecedores</span>
              </CommandItem>
              <CommandItem value="/articles" onSelect={handleSelect}>
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar todos os artigos</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Dicas">
            <CommandItem>
              <span className="text-muted-foreground text-sm">Digite o nome do fornecedor ou artigo que deseja buscar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
