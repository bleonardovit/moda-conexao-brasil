
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

  // Safely extract values and ensure they are strings, avoiding any Symbol values
  const safeTitle = title || (seoSettings?.site_title ? String(seoSettings.site_title) : null) || defaultTitle;
  const safeDescription = description || (seoSettings?.site_description ? String(seoSettings.site_description) : null) || defaultDescription;
  const safeImage = image || (seoSettings?.site_image_url ? String(seoSettings.site_image_url) : null) || defaultImage;
  const safeUrl = url || (seoSettings?.site_url ? String(seoSettings.site_url) : null) || currentUrl;
  const safeSiteName = seoSettings?.site_name ? String(seoSettings.site_name) : "Os Fornecedores";
  const safeType = type ? String(type) : 'website';

  // Ensure image URL is absolute
  const absoluteImageUrl = safeImage.startsWith('http') 
    ? safeImage 
    : `${new URL(currentUrl).origin}${safeImage}`;

  // Safely handle keywords array
  const keywords = seoSettings?.keywords && Array.isArray(seoSettings.keywords) 
    ? seoSettings.keywords.filter(k => k != null).map(k => String(k)).join(', ')
    : '';

  // Safely handle optional values
  const safeAuthor = seoSettings?.author ? String(seoSettings.author) : null;
  const safeFacebookAppId = seoSettings?.facebook_app_id ? String(seoSettings.facebook_app_id) : null;
  const safeTwitterHandle = seoSettings?.twitter_handle ? String(seoSettings.twitter_handle) : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": safeSiteName,
    "description": safeDescription,
    "url": safeUrl,
    "image": absoluteImageUrl,
    "inLanguage": "pt-BR"
  };

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
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
