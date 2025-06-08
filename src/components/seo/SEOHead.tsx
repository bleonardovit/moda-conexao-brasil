
import React, { useEffect } from 'react';
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

  if (!seoSettings) {
    return null;
  }

  const seoTitle = title || seoSettings.site_title;
  const seoDescription = description || seoSettings.site_description;
  const seoImage = image || seoSettings.site_image_url;
  const seoUrl = url || seoSettings.site_url;

  return (
    <Helmet>
      {/* Básicos */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoSettings.keywords.join(', ')} />
      {seoSettings.author && <meta name="author" content={seoSettings.author} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:site_name" content={seoSettings.site_name} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      {seoImage && <meta property="og:image:width" content="1200" />}
      {seoImage && <meta property="og:image:height" content="630" />}
      {seoSettings.facebook_app_id && (
        <meta property="fb:app_id" content={seoSettings.facebook_app_id} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
      {seoSettings.twitter_handle && (
        <meta name="twitter:site" content={seoSettings.twitter_handle} />
      )}
      {seoSettings.twitter_handle && (
        <meta name="twitter:creator" content={seoSettings.twitter_handle} />
      )}
      
      {/* WhatsApp */}
      {seoImage && <meta property="og:image:type" content="image/jpeg" />}
      
      {/* Viewport and other important meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={seoUrl} />
    </Helmet>
  );
};
