
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="rounded-full text-muted-foreground hover:text-foreground"
      title={resolvedTheme === 'dark' ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">
        {resolvedTheme === 'dark' ? "Ativar modo claro" : "Ativar modo escuro"}
      </span>
    </Button>
  );
}
