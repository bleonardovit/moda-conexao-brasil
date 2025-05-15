import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getRegionalData } from '@/services/reportService';
import { Skeleton } from "@/components/ui/skeleton";
import MapboxMapComponent from '@/components/maps/MapboxMap'; // New map component
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

async function fetchMapboxToken(): Promise<string | null> {
  // In a real application, this should be fetched from a secure Supabase Edge Function
  // that reads the token from Supabase Secrets.
  // Example: const { data, error } = await supabase.functions.invoke('get-mapbox-token');
  // For now, we'll try to get it from environment variables (if you set it up for local dev)
  // or return a placeholder (which will likely fail if not a valid token).
  // IMPORTANT: Replace this with a secure fetching mechanism.
  
  // Placeholder for local development if you set VITE_MAPBOX_TOKEN in .env
  // This is NOT secure for production.
  const localDevToken = import.meta.env.VITE_MAPBOX_TOKEN;
  if (localDevToken) return localDevToken;

  // Attempt to fetch from Supabase secrets via a hypothetical function
  // This is the recommended approach. You need to create this 'get-mapbox-token' Edge Function.
  try {
    const { data, error } = await supabase.functions.invoke('get-mapbox-token');
    if (error) {
      console.error('Error fetching Mapbox token from Supabase function:', error);
      // Fallback or error state if necessary
      // return 'YOUR_FALLBACK_MAPBOX_TOKEN_IF_ANY'; // Not recommended to hardcode
      return null;
    }
    if (data && data.token) {
      return data.token;
    }
    console.warn('Mapbox token function did not return a token.');
    return null;
  } catch (e) {
    console.error('Exception while invoking Mapbox token function:', e);
    return null; // Ensure it returns null on error
  }
}

export function GeoInsights() {
  const [compareMetric, setCompareMetric] = useState<"users" | "suppliers" | "conversions">("users");
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenFetchAttempted, setTokenFetchAttempted] = useState(false);
  
  // Fetch regional data
  const { data: regionData, isLoading, error: regionError } = useQuery({
    queryKey: ['regional-data'],
    queryFn: getRegionalData
  });

  useEffect(() => {
    async function loadToken() {
      const token = await fetchMapboxToken();
      setMapboxToken(token);
      setTokenFetchAttempted(true);
    }
    loadToken();
  }, []);
  
  if (regionError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Erro ao carregar dados regionais: {(regionError as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentMapData = () => {
    if (!regionData) return [];
    switch (compareMetric) {
      case 'users':
        return regionData.users.map(u => ({ state: u.state, count: u.count }));
      case 'suppliers':
        return regionData.suppliers.map(s => ({ state: s.state, count: s.count }));
      case 'conversions':
        return regionData.conversions.map(c => ({ state: c.state, rate: c.rate }));
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Insights Geográficos</span>
          <Select 
            value={compareMetric} 
            onValueChange={(value: "users" | "suppliers" | "conversions") => setCompareMetric(value)}
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
                {compareMetric === "users" && regionData?.users && (
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
                      {regionData.users.map((row) => (
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
                
                {compareMetric === "suppliers" && regionData?.suppliers && (
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
                      {regionData.suppliers.map((row) => (
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
                
                {compareMetric === "conversions" && regionData?.conversions && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Taxa de Conversão</TableHead>
                        <TableHead className="text-right">Mudança</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionData.conversions.map((row) => (
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
                 {(!regionData || (compareMetric === "users" && !regionData.users.length) || (compareMetric === "suppliers" && !regionData.suppliers.length) || (compareMetric === "conversions" && !regionData.conversions.length)) && !isLoading && (
                    <p className="text-center text-muted-foreground py-4">Nenhum dado disponível para esta métrica.</p>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="map">
            {isLoading && <Skeleton className="h-[400px] w-full" />}
            {!isLoading && regionData && tokenFetchAttempted && (
              <MapboxMapComponent 
                data={currentMapData()} 
                metricType={compareMetric}
                mapboxToken={mapboxToken}
              />
            )}
            {!isLoading && regionData && !tokenFetchAttempted && (
                 <Skeleton className="h-[400px] w-full" /> // Show skeleton while token is fetching
            )}
             {!isLoading && !regionData && (
                <div className="h-[400px] flex justify-center items-center border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">Dados do mapa indisponíveis.</p>
                </div>
            )}

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
                  {compareMetric === "users" && regionData?.users ? (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                          <div className="text-xl font-bold">
                            {regionData.users.sort((a,b) => b.count - a.count)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm">
                            {regionData.users.sort((a,b) => b.count - a.count)[0]?.count || 0} usuárias ({regionData.users.sort((a,b) => b.count - a.count)[0]?.percentage || 0}%)
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData.users.sort((a, b) => b.growth - a.growth)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData.users.sort((a, b) => b.growth - a.growth)[0]?.growth || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior potencial</div>
                          <div className="text-xl font-bold">
                             {regionData.users.filter(u => u.growth < 0).sort((a,b) => b.count - a.count)[0]?.state || regionData.users[1]?.state || "N/A"}
                          </div>
                          <div className="text-sm">
                            Baseado em tamanho e crescimento
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total cobertura</div>
                          <div className="text-xl font-bold">
                            {regionData.users.length || 0} Estados
                          </div>
                          <div className="text-sm">
                            {Math.round(regionData.users.reduce((acc, curr) => acc + curr.percentage, 0))}% das usuárias
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : compareMetric === "suppliers" && regionData?.suppliers ? (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior concentração</div>
                          <div className="text-xl font-bold">
                            {regionData.suppliers.sort((a,b) => b.count - a.count)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm">
                            {regionData.suppliers.sort((a,b) => b.count - a.count)[0]?.count || 0} fornecedores ({regionData.suppliers.sort((a,b) => b.count - a.count)[0]?.percentage || 0}%)
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData.suppliers.sort((a, b) => b.growth - a.growth)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData.suppliers.sort((a, b) => b.growth - a.growth)[0]?.growth || 0}%
                          </div>
                        </CardContent>
                      </Card>
                       <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Potencial inexplorado</div>
                           <div className="text-xl font-bold">
                                {regionData.suppliers.filter(s => s.count < (regionData.suppliers.reduce((acc, curr) => acc + curr.count, 0) / (regionData.suppliers.length || 1)) ).sort((a,b) => b.growth - a.growth)[0]?.state || "N/A"}
                           </div>
                          <div className="text-sm">Alta demanda, baixa oferta</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Total cobertura</div>
                          <div className="text-xl font-bold">
                            {regionData.suppliers.length || 0} Estados
                          </div>
                           <div className="text-sm">
                                {Math.round(regionData.suppliers.reduce((acc, curr) => acc + curr.percentage, 0))}% dos fornecedores
                           </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : compareMetric === "conversions" && regionData?.conversions ? (
                    <>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior conversão</div>
                          <div className="text-xl font-bold">
                            {regionData.conversions.sort((a, b) => b.rate - a.rate)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm">
                            {regionData.conversions.sort((a, b) => b.rate - a.rate)[0]?.rate || 0}% taxa de conversão
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Maior crescimento</div>
                          <div className="text-xl font-bold">
                            {regionData.conversions.sort((a, b) => b.change - a.change)[0]?.state || "N/A"}
                          </div>
                          <div className="text-sm text-green-500">
                            +{regionData.conversions.sort((a, b) => b.change - a.change)[0]?.change || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Menor desempenho</div>
                          <div className="text-xl font-bold">
                            {regionData.conversions.sort((a, b) => a.rate - b.rate)[0]?.state || "N/A"}
                          </div>
                          <div className={`text-sm ${regionData.conversions.sort((a, b) => a.change - b.change)[0]?.change >=0 ? 'text-green-500':'text-red-500'}`}>
                            {regionData.conversions.sort((a, b) => a.change - b.change)[0]?.change || 0}%
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-muted-foreground mb-1">Média nacional</div>
                          <div className="text-xl font-bold">
                            {regionData.conversions.length > 0 ? parseFloat(
                              (regionData.conversions.reduce((sum, item) => sum + item.rate, 0) / 
                              regionData.conversions.length).toFixed(1)
                            ) : 0}%
                          </div>
                          <div className="text-sm text-green-500">
                            {regionData.conversions.length > 0 && regionData.conversions.reduce((sum, item) => sum + item.change, 0) / regionData.conversions.length > 0 ? '+' : ''}
                            {regionData.conversions.length > 0 ? (regionData.conversions.reduce((sum, item) => sum + item.change, 0) / regionData.conversions.length).toFixed(1) : 0}% vs período anterior
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                     <p className="col-span-full text-center text-muted-foreground py-4">Selecione uma métrica para ver os destaques.</p>
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
