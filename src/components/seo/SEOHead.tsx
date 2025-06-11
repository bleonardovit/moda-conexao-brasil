
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
    console.warn('Symbol value detected and filtered out:', value.toString());
    return '';
  }
  if (typeof value === 'object') {
    try {
      // Filter out any Symbol properties from objects
      const cleanObj = {};
      for (const key in value) {
        if (typeof key !== 'symbol' && typeof value[key] !== 'symbol') {
          cleanObj[key] = value[key];
        }
      }
      return JSON.stringify(cleanObj);
    } catch {
      return '';
    }
  }
  return String(value);
};

// Helper function to safely extract string values from objects
const safeExtract = (obj: any, key: string, fallback: string = ''): string => {
  try {
    if (!obj || typeof obj !== 'object') {
      return fallback;
    }
    
    // Make sure the key itself isn't a Symbol
    if (typeof key === 'symbol') {
      return fallback;
    }
    
    const value = obj[key];
    const result = safeStringify(value);
    return result || fallback;
  } catch (error) {
    console.warn('Error extracting value for key:', key, error);
    return fallback;
  }
};

// Helper function to completely sanitize an object from Symbol values
const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const sanitized = {};
  try {
    Object.getOwnPropertyNames(obj).forEach(key => {
      if (typeof key !== 'symbol' && typeof obj[key] !== 'symbol') {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    });
  } catch (error) {
    console.warn('Error sanitizing object:', error);
    return {};
  }
  
  return sanitized;
};

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website'
}) => {
  const { seoSettings } = useSEOSettings();

  // Add debugging to see what we're getting
  console.log('SEOHead - Raw seoSettings:', seoSettings);
  
  // Sanitize the entire seoSettings object first
  const cleanSeoSettings = sanitizeObject(seoSettings);
  console.log('SEOHead - Cleaned seoSettings:', cleanSeoSettings);

  // Fallback values for better SEO
  const defaultTitle = "Os Fornecedores - Encontre os Melhores Fornecedores de Moda do Brasil";
  const defaultDescription = "Acesse uma rede exclusiva de fornecedores verificados para impulsionar seu negócio de moda. Conecte-se aos melhores fornecedores do Brasil.";
  const defaultImage = "/images/mosaico.png";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://fornecedores.lovable.app';

  // Safely extract values ensuring they are strings
  const safeTitle = title || safeExtract(cleanSeoSettings, 'site_title', defaultTitle);
  const safeDescription = description || safeExtract(cleanSeoSettings, 'site_description', defaultDescription);
  const safeImage = image || safeExtract(cleanSeoSettings, 'site_image_url', defaultImage);
  const safeUrl = url || safeExtract(cleanSeoSettings, 'site_url', currentUrl);
  const safeSiteName = safeExtract(cleanSeoSettings, 'site_name', "Os Fornecedores");
  const safeType = safeStringify(type) || 'website';

  // Ensure image URL is absolute
  const absoluteImageUrl = safeImage.startsWith('http') 
    ? safeImage 
    : `${new URL(currentUrl).origin}${safeImage}`;

  // Safely handle keywords array
  let keywords = '';
  try {
    const keywordsValue = cleanSeoSettings?.keywords;
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
  const safeAuthor = safeExtract(cleanSeoSettings, 'author');
  const safeFacebookAppId = safeExtract(cleanSeoSettings, 'facebook_app_id');
  const safeTwitterHandle = safeExtract(cleanSeoSettings, 'twitter_handle');

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

  // Final safety check - log all values that will be passed to Helmet
  console.log('SEOHead - Final values:', {
    safeTitle,
    safeDescription,
    keywords,
    safeAuthor,
    safeType,
    safeUrl,
    safeSiteName,
    absoluteImageUrl,
    safeFacebookAppId,
    safeTwitterHandle,
    structuredDataString
  });

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
