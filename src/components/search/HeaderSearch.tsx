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
import { getSuppliers } from '@/services/supplierService';
import { getArticles } from '@/services/articleService';
import type { Supplier } from '@/types';
import type { Article } from '@/types/article';
import { useAuth } from '@/hooks/useAuth';

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch suppliers and articles when search is opened
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch suppliers
          if (suppliers.length === 0) {
            const suppliersData = await getSuppliers(user?.id);
            // Filter only visible suppliers
            setSuppliers(suppliersData ? suppliersData.filter(supplier => !supplier.hidden) : []);
          }
          
          // Fetch articles
          if (articles.length === 0) {
            const articlesData = await getArticles();
            // Filter only published articles
            setArticles(articlesData.filter(article => article.published));
          }
        } catch (error) {
          console.error('Error fetching data for search:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [open, suppliers.length, articles.length, user?.id]);

  // Dynamic search for suppliers
  const filteredSuppliers = useMemo(() => {
    if (!query || !Array.isArray(suppliers)) return [];
    
    return suppliers.filter(supplier =>
      supplier.name?.toLowerCase().includes(query.toLowerCase()) ||
      supplier.description?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, suppliers]);

  // Dynamic search for articles
  const filteredArticles = useMemo(() => {
    if (!query || !Array.isArray(articles)) return [];
    
    return articles.filter(article =>
      article.title?.toLowerCase().includes(query.toLowerCase()) ||
      article.summary?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, articles]);

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
          {query ? (
            <>
              {filteredSuppliers && filteredSuppliers.length > 0 && (
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
              {filteredArticles && filteredArticles.length > 0 && (
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
              <span className="text-muted-foreground text-sm">Digite o nome do fornecedor ou artigo que deseja buscar</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
