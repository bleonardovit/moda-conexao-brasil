
import { useState } from 'react';
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
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Usar hook otimizado para busca
  const { suppliers, articles, isLoading } = useOptimizedSearch(query, 5);

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
          <CommandEmpty>
            {isLoading ? "Carregando..." : "Nenhum resultado encontrado."}
          </CommandEmpty>
          {query && query.length >= 2 ? (
            <>
              {suppliers && suppliers.length > 0 && (
                <CommandGroup heading="Fornecedores">
                  {suppliers.map(supplier => (
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
              {articles && articles.length > 0 && (
                <CommandGroup heading="Artigos">
                  {articles.map(article => (
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
              <CommandItem value="/suppliers" onSelect={() => handleSelect("/suppliers")}>
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar todos os fornecedores</span>
              </CommandItem>
              <CommandItem value="/articles" onSelect={() => handleSelect("/articles")}>
                <Search className="mr-2 h-4 w-4" />
                <span>Buscar todos os artigos</span>
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading="Dicas">
            <CommandItem>
              <span className="text-muted-foreground text-sm">Digite pelo menos 2 caracteres para buscar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
