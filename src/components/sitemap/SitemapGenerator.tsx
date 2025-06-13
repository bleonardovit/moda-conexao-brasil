
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function SitemapGenerator() {
  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-sitemap');
        
        if (error) {
          console.error('Error generating sitemap:', error);
          return;
        }
        
        // Set the appropriate headers for XML content
        const response = new Response(data, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        });
        
        // Get the XML content
        const xmlContent = await response.text();
        
        // Replace the current page content with the XML
        document.open();
        document.write(xmlContent);
        document.close();
        
      } catch (err) {
        console.error('Failed to generate sitemap:', err);
        document.open();
        document.write('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
        document.close();
      }
    };
    
    generateSitemap();
  }, []);

  return null;
}
