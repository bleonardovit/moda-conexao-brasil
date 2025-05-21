
import { Button } from "@/components/ui/button";
import { Search, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function LimitedSearch() {
  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Busca Avançada Indisponível</h2>
          
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            A funcionalidade de busca avançada não está disponível durante o período de teste gratuito.
            Assine agora para ter acesso completo a todas as ferramentas de busca.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth/payment">
                Assinar agora
              </Link>
            </Button>
            
            <Button variant="outline" asChild size="lg">
              <Link to="/suppliers">
                Ver fornecedores disponíveis
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 pb-4 pt-4 border-t flex justify-center">
        <div className="flex items-center text-sm text-muted-foreground">
          <Lock className="mr-2 h-4 w-4" />
          <span>A busca avançada permite encontrar fornecedores com filtros específicos</span>
        </div>
      </CardFooter>
    </Card>
  );
}
