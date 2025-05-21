
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export interface LockedSupplierCardProps {
  name?: string;
  city?: string;
  state?: string;
}

export function LockedSupplierCard({ name, city, state }: LockedSupplierCardProps) {
  const { toast } = useToast();
  
  const handleLockedClick = () => {
    toast({
      title: "Acesso bloqueado",
      description: "Este fornecedor não está disponível no período de teste. Assine para acessar todos os fornecedores.",
      variant: "default",
    });
  };

  return (
    <Card className="overflow-hidden card-hover opacity-70 relative">
      <div className="sm:flex">
        <div className="sm:w-1/3 md:w-1/4 h-48 sm:h-auto bg-accent blur-sm">
          {/* Blurred placeholder image */}
          <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        </div>
        <CardContent className="sm:w-2/3 md:w-3/4 p-4 relative">
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] z-10">
            <div className="text-center p-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">Fornecedor Bloqueado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Disponível apenas para assinantes
              </p>
              <Button asChild>
                <Link to="/auth/payment">Assinar agora</Link>
              </Button>
            </div>
          </div>
          
          {/* Blurred content underneath */}
          <div className="blur-sm">
            <h3 className="text-lg font-bold">
              {name || "Nome do fornecedor"}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              {city && state ? `${city}, ${state}` : "Localização"}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
