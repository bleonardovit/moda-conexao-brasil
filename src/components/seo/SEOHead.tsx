
import React from 'react';
import { Helmet } from 'react-helmet';
import { useSEOSettings } from '@/hooks/use-seo-settings';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website'
}) => {
  const { seoSettings } = useSEOSettings();

  // Fallback values for better SEO
  const defaultTitle = "Os Fornecedores - Encontre os Melhores Fornecedores de Moda do Brasil";
  const defaultDescription = "Acesse uma rede exclusiva de fornecedores verificados para impulsionar seu negócio de moda. Conecte-se aos melhores fornecedores do Brasil.";
  const defaultImage = "/images/mosaico.png";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://fornecedores.lovable.app';

  // Ultra-safe string conversion that completely eliminates any Symbol possibility
  const safeString = (value: any, fallback: string = ''): string => {
    // If value is null, undefined, or a Symbol, return fallback immediately
    if (value === null || value === undefined || typeof value === 'symbol') {
      return fallback;
    }
    
    // If it's already a string, return it
    if (typeof value === 'string') {
      return value;
    }
    
    // For any other type, try to convert safely
    try {
      // Handle arrays specially
      if (Array.isArray(value)) {
        return value
          .filter(item => item !== null && item !== undefined && typeof item !== 'symbol')
          .map(item => typeof item === 'string' ? item : String(item))
          .join(', ');
      }
      
      return String(value);
    } catch {
      return fallback;
    }
  };

  // Extract safe values with complete Symbol protection
  const safeTitle = safeString(title || seoSettings?.site_title, defaultTitle);
  const safeDescription = safeString(description || seoSettings?.site_description, defaultDescription);
  const safeImage = safeString(image || seoSettings?.site_image_url, defaultImage);
  const safeUrl = safeString(url || seoSettings?.site_url, currentUrl);
  const safeSiteName = safeString(seoSettings?.site_name, "Os Fornecedores");
  const safeAuthor = safeString(seoSettings?.author, "");
  const safeFacebookAppId = safeString(seoSettings?.facebook_app_id, "");
  const safeTwitterHandle = safeString(seoSettings?.twitter_handle, "");
  const safeType = safeString(type, 'website');

  // Handle keywords with extra safety
  const keywords = safeString(seoSettings?.keywords, '');

  // Ensure image URL is absolute
  const absoluteImageUrl = safeImage.startsWith('http') 
    ? safeImage 
    : `${new URL(currentUrl).origin}${safeImage}`;

  // Create structured data with only safe string values
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": safeSiteName,
    "description": safeDescription,
    "url": safeUrl,
    "image": absoluteImageUrl,
    "inLanguage": "pt-BR"
  };

  // Safely stringify structured data
  let structuredDataString = '';
  try {
    structuredDataString = JSON.stringify(structuredData);
  } catch {
    structuredDataString = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Os Fornecedores",
      "description": defaultDescription,
      "url": currentUrl,
      "image": absoluteImageUrl,
      "inLanguage": "pt-BR"
    });
  }

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {safeAuthor && <meta name="author" content={safeAuthor} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={safeType} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={safeUrl} />
      <meta property="og:site_name" content={safeSiteName} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="pt_BR" />
      {safeFacebookAppId && (
        <meta property="fb:app_id" content={safeFacebookAppId} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={safeTitle} />
      {safeTwitterHandle && (
        <>
          <meta name="twitter:site" content={safeTwitterHandle} />
          <meta name="twitter:creator" content={safeTwitterHandle} />
        </>
      )}
      
      {/* WhatsApp specific */}
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      
      {/* Additional meta tags for better sharing */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="content-language" content="pt-BR" />
      <link rel="canonical" href={safeUrl} />
      
      {/* Structured data for better understanding */}
      <script type="application/ld+json">
        {structuredDataString}
      </script>
    </Helmet>
  );
};
