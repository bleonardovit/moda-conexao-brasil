
import React from 'react';
import { SEOHead } from './SEOHead';

interface GlobalSEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const GlobalSEO: React.FC<GlobalSEOProps> = ({
  title,
  description,
  image,
  url,
  type = 'website'
}) => {
  // SEO dinâmico temporariamente desabilitado
  // O SEO estático no index.html continuará funcionando
  console.log('GlobalSEO: SEO dinâmico temporariamente desabilitado');
  
  return (
    <SEOHead
      title={title}
      description={description}
      image={image}
      url={url}
      type={type}
    />
  );
};
