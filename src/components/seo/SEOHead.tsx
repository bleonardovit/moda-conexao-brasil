
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

  const seoTitle = title || seoSettings?.site_title || defaultTitle;
  const seoDescription = description || seoSettings?.site_description || defaultDescription;
  const seoImage = image || seoSettings?.site_image_url || defaultImage;
  const seoUrl = url || seoSettings?.site_url || currentUrl;
  const siteName = seoSettings?.site_name || "Os Fornecedores";

  // Ensure image URL is absolute
  const absoluteImageUrl = seoImage.startsWith('http') 
    ? seoImage 
    : `${new URL(currentUrl).origin}${seoImage}`;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {seoSettings?.keywords && (
        <meta name="keywords" content={seoSettings.keywords.join(', ')} />
      )}
      {seoSettings?.author && <meta name="author" content={seoSettings.author} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="pt_BR" />
      {seoSettings?.facebook_app_id && (
        <meta property="fb:app_id" content={seoSettings.facebook_app_id} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={seoTitle} />
      {seoSettings?.twitter_handle && (
        <>
          <meta name="twitter:site" content={seoSettings.twitter_handle} />
          <meta name="twitter:creator" content={seoSettings.twitter_handle} />
        </>
      )}
      
      {/* WhatsApp specific */}
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      
      {/* Additional meta tags for better sharing */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <meta httpEquiv="content-language" content="pt-BR" />
      <link rel="canonical" href={seoUrl} />
      
      {/* Structured data for better understanding */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": siteName,
          "description": seoDescription,
          "url": seoUrl,
          "image": absoluteImageUrl,
          "inLanguage": "pt-BR"
        })}
      </script>
    </Helmet>
  );
};
