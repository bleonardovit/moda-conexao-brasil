
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

// Helper function to safely convert any value to string, handling Symbols and null/undefined
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'symbol') {
    return '';
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
};

// Helper function to safely extract string values from objects
const safeExtract = (obj: any, key: string, fallback: string = ''): string => {
  try {
    const value = obj?.[key];
    return safeStringify(value) || fallback;
  } catch {
    return fallback;
  }
};

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

  // Safely extract values ensuring they are strings
  const safeTitle = title || safeExtract(seoSettings, 'site_title', defaultTitle);
  const safeDescription = description || safeExtract(seoSettings, 'site_description', defaultDescription);
  const safeImage = image || safeExtract(seoSettings, 'site_image_url', defaultImage);
  const safeUrl = url || safeExtract(seoSettings, 'site_url', currentUrl);
  const safeSiteName = safeExtract(seoSettings, 'site_name', "Os Fornecedores");
  const safeType = safeStringify(type) || 'website';

  // Ensure image URL is absolute
  const absoluteImageUrl = safeImage.startsWith('http') 
    ? safeImage 
    : `${new URL(currentUrl).origin}${safeImage}`;

  // Safely handle keywords array
  let keywords = '';
  try {
    const keywordsValue = seoSettings?.keywords;
    if (Array.isArray(keywordsValue)) {
      keywords = keywordsValue
        .filter(k => k != null && typeof k !== 'symbol')
        .map(k => safeStringify(k))
        .filter(k => k.length > 0)
        .join(', ');
    }
  } catch {
    keywords = '';
  }

  // Safely handle optional values
  const safeAuthor = safeExtract(seoSettings, 'author');
  const safeFacebookAppId = safeExtract(seoSettings, 'facebook_app_id');
  const safeTwitterHandle = safeExtract(seoSettings, 'twitter_handle');

  // Create structured data with safe values
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
