
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

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
        <CommandInput placeholder="Buscar fornecedores, artigos..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
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
