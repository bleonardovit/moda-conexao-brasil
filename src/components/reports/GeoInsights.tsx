
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getRegionalData } from '@/services/reportService';
import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";

export function GeoInsights() {
  const [compareMetric, setCompareMetric] = useState("users");
  
  // Fetch regional data
  const { data: regionData, isLoading, error } = useQuery({
    queryKey: ['regional-data'],
    queryFn: getRegionalData
  });
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Erro ao carregar dados regionais: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Insights Geográficos</span>
          <Select 
            value={compareMetric} 
            onValueChange={setCompareMetric}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione a métrica" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="users">Usuárias</SelectItem>
              <SelectItem value="suppliers">Fornecedores</SelectItem>
              <SelectItem value="conversions">Conversões</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="table">Tabela</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="table">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {compareMetric === "users" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Usuárias</TableHead>
                        <TableHead className="text-right">% do Total</TableHead>
                        <TableHead className="text-right">Crescimento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionData?.users.map((row) => (
                        <TableRow key={row.state}>
                          <TableCell className="font-medium">{row.state}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{row.percentage}%</TableCell>
                          <TableCell className={`text-right ${row.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {row.growth > 0 ? "+" : ""}{row.growth}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {compareMetric === "suppliers" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Fornecedores</TableHead>
                        <TableHead className="text-right">% do Total</TableHead>
                        <TableHead className="text-right">Crescimento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionData?.suppliers.map((row) => (
                        <TableRow key={row.state}>
                          <TableCell className="font-medium">{row.state}</TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{row.percentage}%</TableCell>
                          <TableCell className={`text-right ${row.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {row.growth > 0 ? "+" : ""}{row.growth}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {compareMetric === "conversions" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Taxa de Conversão</TableHead>
                        <TableHead className="text-right">Mudança</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionData?.conversions.map((row) => (
                        <TableRow key={row.state}>
                          <TableCell className="font-medium">{row.state}</TableCell>
                          <TableCell className="text-right">{row.rate}%</TableCell>
                          <TableCell className={`text-right ${row.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {row.change > 0 ? "+" : ""}{row.change}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="map">
            <div className="h-[300px] flex justify-center items-center border rounded-md bg-muted/20">
              <div className="text-center p-4">
                <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">Mapa do Brasil</p>
                <p className="text-sm text-muted-foreground">Visualização de dados por estado</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrando dados de {compareMetric === "users" ? "usuárias" : 
                    compareMetric === "suppliers" ? "fornecedores" : "conversões"} por região
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Destaque Regional</h3>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="bg-muted/30">
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {compareMetric === "users" ? (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                          <div className="text-xl font-bold">
                            {regionData?.users[0]?.state || "São Paulo"}
                          </div>
                          <div className="text-sm">
                            {regionData?.users[0]?.count || 0} usuárias ({regionData?.users[0]?.percentage || 0}%)
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData?.users.sort((a, b) => b.growth - a.growth)[0]?.state || "Ceará"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData?.users.sort((a, b) => b.growth - a.growth)[0]?.growth || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior potencial</div>
                          <div className="text-xl font-bold">Minas Gerais</div>
                          <div className="text-sm">Crescimento projetado: +15%</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total cobertura</div>
                          <div className="text-xl font-bold">
                            {regionData?.users.length || 0} Estados
                          </div>
                          <div className="text-sm">82% das usuárias</div>
                        </CardContent>
                      </Card>
                    </>
                  ) : compareMetric === "suppliers" ? (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                          <div className="text-xl font-bold">
                            {regionData?.suppliers[0]?.state || "São Paulo"}
                          </div>
                          <div className="text-sm">
                            {regionData?.suppliers[0]?.count || 0} fornecedores ({regionData?.suppliers[0]?.percentage || 0}%)
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData?.suppliers.sort((a, b) => b.growth - a.growth)[0]?.state || "Ceará"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData?.suppliers.sort((a, b) => b.growth - a.growth)[0]?.growth || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Potencial inexplorado</div>
                          <div className="text-xl font-bold">Bahia</div>
                          <div className="text-sm">6 fornecedores potenciais</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total cobertura</div>
                          <div className="text-xl font-bold">
                            {regionData?.suppliers.length || 0} Estados
                          </div>
                          <div className="text-sm">100% dos fornecedores</div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior conversão</div>
                          <div className="text-xl font-bold">
                            {regionData?.conversions.sort((a, b) => b.rate - a.rate)[0]?.state || "Ceará"}
                          </div>
                          <div className="text-sm">
                            {regionData?.conversions.sort((a, b) => b.rate - a.rate)[0]?.rate || 0}% taxa de conversão
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData?.conversions.sort((a, b) => b.change - a.change)[0]?.state || "Ceará"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData?.conversions.sort((a, b) => b.change - a.change)[0]?.change || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Menor desempenho</div>
                          <div className="text-xl font-bold">
                            {regionData?.conversions.sort((a, b) => a.change - b.change)[0]?.state || "Rio de Janeiro"}
                          </div>
                          <div className="text-sm text-red-500">
                            {regionData?.conversions.sort((a, b) => a.change - b.change)[0]?.change || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Média nacional</div>
                          <div className="text-xl font-bold">
                            {regionData ? parseFloat(
                              (regionData.conversions.reduce((sum, item) => sum + item.rate, 0) / 
                              (regionData.conversions.length || 1)).toFixed(1)
                            ) : 0}%
                          </div>
                          <div className="text-sm text-green-500">+1.1% vs mês anterior</div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
