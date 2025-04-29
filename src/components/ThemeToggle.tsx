
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full text-muted-foreground hover:text-foreground"
      title={theme === 'dark' ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">
        {theme === 'dark' ? "Ativar modo claro" : "Ativar modo escuro"}
      </span>
    </Button>
  );
}
