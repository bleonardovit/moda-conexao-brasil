
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for regional statistics
const REGIONAL_DATA = {
  "users": [
    { state: "SP", count: 450, percentage: 36, growth: 5.2 },
    { state: "RJ", count: 230, percentage: 18.4, growth: 3.7 },
    { state: "CE", count: 175, percentage: 14, growth: 8.3 },
    { state: "MG", count: 153, percentage: 12.2, growth: 2.1 },
    { state: "GO", count: 102, percentage: 8.2, growth: 4.5 },
    { state: "Outros", count: 140, percentage: 11.2, growth: 3.2 },
  ],
  "suppliers": [
    { state: "SP", count: 32, percentage: 36.8, growth: 4.1 },
    { state: "CE", count: 18, percentage: 20.7, growth: 9.5 },
    { state: "GO", count: 15, percentage: 17.2, growth: 7.2 },
    { state: "MG", count: 12, percentage: 13.8, growth: 2.8 },
    { state: "PE", count: 10, percentage: 11.5, growth: 5.3 },
  ],
  "conversions": [
    { state: "SP", rate: 12.3, change: 1.2 },
    { state: "RJ", rate: 10.8, change: -0.5 },
    { state: "CE", rate: 14.7, change: 2.8 },
    { state: "MG", rate: 9.6, change: 0.3 },
    { state: "GO", rate: 11.2, change: 1.7 },
  ]
};

export function GeoInsights() {
  const [compareMetric, setCompareMetric] = useState("users");
  
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
                  {REGIONAL_DATA.users.map((row) => (
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
                  {REGIONAL_DATA.suppliers.map((row) => (
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
                  {REGIONAL_DATA.conversions.map((row) => (
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
          </TabsContent>
          
          <TabsContent value="map">
            <div className="h-[300px] flex justify-center items-center border rounded-md bg-muted/20">
              <div className="text-center p-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {compareMetric === "users" ? (
                  <>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                        <div className="text-xl font-bold">São Paulo</div>
                        <div className="text-sm">450 usuárias (36%)</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                        <div className="text-xl font-bold">Ceará</div>
                        <div className="text-sm text-green-500">+8.3%</div>
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
                        <div className="text-xl font-bold">5 Estados</div>
                        <div className="text-sm">82% das usuárias</div>
                      </CardContent>
                    </Card>
                  </>
                ) : compareMetric === "suppliers" ? (
                  <>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                        <div className="text-xl font-bold">São Paulo</div>
                        <div className="text-sm">32 fornecedores (36.8%)</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                        <div className="text-xl font-bold">Ceará</div>
                        <div className="text-sm text-green-500">+9.5%</div>
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
                        <div className="text-xl font-bold">5 Estados</div>
                        <div className="text-sm">100% dos fornecedores</div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior conversão</div>
                        <div className="text-xl font-bold">Ceará</div>
                        <div className="text-sm">14.7% taxa de conversão</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                        <div className="text-xl font-bold">Ceará</div>
                        <div className="text-sm text-green-500">+2.8%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Menor desempenho</div>
                        <div className="text-xl font-bold">Rio de Janeiro</div>
                        <div className="text-sm text-red-500">-0.5%</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground mb-1">Média nacional</div>
                        <div className="text-xl font-bold">11.7%</div>
                        <div className="text-sm text-green-500">+1.1% vs mês anterior</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
