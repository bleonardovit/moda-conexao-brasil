
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { Map as MapboxMapInstance, GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';

// Simplified GeoJSON for Brazil States (consider using a more detailed one from a CDN for production)
// Source: Adapted from public domain data or simplified for example
const brazilGeoJson = {
  type: "FeatureCollection",
  features: [
    // Add features for Brazilian states here. Example for SP:
    // { "type": "Feature", "properties": { "sigla": "SP" }, "geometry": { ... } }
    // For brevity, I'll use a placeholder structure. You'd need actual geometries.
    // A full GeoJSON is too large for this response.
    // Placeholder - Replace with actual Brazil GeoJSON data
    { "type": "Feature", "properties": { "name": "São Paulo", "sigla": "SP" }, "geometry": { "type": "Point", "coordinates": [-46.6333, -23.5505] } },
    { "type": "Feature", "properties": { "name": "Rio de Janeiro", "sigla": "RJ" }, "geometry": { "type": "Point", "coordinates": [-43.1729, -22.9068] } },
    { "type": "Feature", "properties": { "name": "Minas Gerais", "sigla": "MG" }, "geometry": { "type": "Point", "coordinates": [-44.5550, -18.5122] } },
    { "type": "Feature", "properties": { "name": "Bahia", "sigla": "BA" }, "geometry": { "type": "Point", "coordinates": [-41.2909, -12.9600] } },
    { "type": "Feature", "properties": { "name": "Rio Grande do Sul", "sigla": "RS" }, "geometry": { "type": "Point", "coordinates": [-53.1642, -30.0346] } },
    { "type": "Feature", "properties": { "name": "Paraná", "sigla": "PR" }, "geometry": { "type": "Point", "coordinates": [-51.9152, -24.9961] } },
    { "type": "Feature", "properties": { "name": "Ceará", "sigla": "CE" }, "geometry": { "type": "Point", "coordinates": [-39.5730, -5.7915] } },
    { "type": "Feature", "properties": { "name": "Goiás", "sigla": "GO" }, "geometry": { "type": "Point", "coordinates": [-49.8631, -15.8270] } }
    // ... add other states
  ]
};

interface MapDataPoint {
  state: string; // State abbreviation, e.g., "SP"
  count?: number;
  rate?: number;
  // Add other potential values like 'growth', 'percentage' if needed for map styling
}

interface MapboxMapProps {
  data: MapDataPoint[];
  metricType: 'users' | 'suppliers' | 'conversions';
  mapboxToken: string | null; // Allow null while fetching
}

const MapboxMapComponent: React.FC<MapboxMapProps> = ({ data, metricType, mapboxToken }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMapInstance | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!mapboxToken) {
      console.warn("Mapbox token is not yet available.");
      // Optionally show a specific message or skeleton if token is null
      return;
    }
    if (mapboxgl.accessToken !== mapboxToken) {
        mapboxgl.accessToken = mapboxToken;
    }

    if (mapRef.current || !mapContainerRef.current) return; // Initialize map only once

    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v10', // or your preferred style
        center: [-52, -14], // Brazil center
        zoom: 3.5,
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
        // Add Brazil GeoJSON data source
        // In a real app, fetch this GeoJSON or ensure it's more complete.
        // The one provided is a placeholder with points. A real choropleth map needs polygons.
        if (mapRef.current?.getSource('brazil-states')) {
            (mapRef.current.getSource('brazil-states') as GeoJSONSource).setData(brazilGeoJson as any);
        } else {
            mapRef.current?.addSource('brazil-states', {
                type: 'geojson',
                data: brazilGeoJson as any, // Cast to any if properties are not perfectly matching GeoJSON spec
            });
        }

        // Add a layer to visualize states (e.g., simple circles for point data)
        // For a choropleth map, you'd use 'fill' type and 'fill-color' expressions.
        if (!mapRef.current?.getLayer('state-points')) {
            mapRef.current?.addLayer({
                id: 'state-points',
                type: 'circle',
                source: 'brazil-states',
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['get', 'value'], // 'value' will be set from props
                        0, 5,
                        100, 10,
                        1000, 20
                    ],
                    'circle-color': [
                        'interpolate', ['linear'], ['get', 'value'],
                        0, '#ffffcc',
                        100, '#a1dab4',
                        500, '#41b6c4',
                        1000, '#2c7fb8',
                        5000, '#253494'
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff'
                }
            });
        }
        
        // Add interactivity (e.g., tooltips)
        mapRef.current?.on('click', 'state-points', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const properties = feature.properties;
            const value = properties?.value; // Value dynamically added
            const stateName = properties?.name || properties?.sigla;

            new mapboxgl.Popup()
              .setLngLat((e.lngLat as any)) // Use e.lngLat which is correct
              .setHTML(\`<strong>\${stateName}</strong><br />\${metricType}: \${value?.toLocaleString() || 'N/A'}\`)
              .addTo(mapRef.current!);
          }
        });

        mapRef.current?.on('mouseenter', 'state-points', () => {
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
        });
        mapRef.current?.on('mouseleave', 'state-points', () => {
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
        });

      });
    } catch (error) {
        console.error("Failed to initialize Mapbox map:", error);
        if (error.message.includes("Failed to fetch") || error.message.includes("accessToken")) {
            setTokenError(true);
        }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken]); // Re-run if token changes

  useEffect(() => {
    if (!mapLoaded || !mapRef.current?.getSource('brazil-states')) return;

    // Create a new GeoJSON object with data values merged into properties
    const geoJsonWithData = {
      type: "FeatureCollection",
      features: brazilGeoJson.features.map(feature => {
        const stateSigla = feature.properties.sigla;
        const stateData = data.find(d => d.state === stateSigla);
        let value;
        switch (metricType) {
          case 'users':
          case 'suppliers':
            value = stateData?.count ?? 0;
            break;
          case 'conversions':
            value = stateData?.rate ?? 0;
            break;
          default:
            value = 0;
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            value: value
          }
        };
      })
    };

    (mapRef.current.getSource('brazil-states') as GeoJSONSource).setData(geoJsonWithData as any);

  }, [data, metricType, mapLoaded]);

  if (tokenError) {
    return (
      <div className="h-[400px] flex flex-col justify-center items-center border rounded-md bg-destructive/10 text-destructive p-4">
        <p className="font-semibold">Erro ao carregar o mapa.</p>
        <p className="text-sm">Verifique se o Token de Acesso do Mapbox está configurado corretamente como um Segredo no Supabase (`MAPBOX_PUBLIC_TOKEN`).</p>
      </div>
    );
  }
  
  if (!mapboxToken && !mapLoaded) {
     return (
        <div className="h-[400px] flex flex-col justify-center items-center border rounded-md bg-muted/20 p-4">
            <p>Configurando o token do Mapbox...</p>
            <Skeleton className="h-[350px] w-full mt-2" />
        </div>
     );
  }


  return <div ref={mapContainerRef} className="h-[400px] w-full rounded-md" />;
};

export default MapboxMapComponent;
