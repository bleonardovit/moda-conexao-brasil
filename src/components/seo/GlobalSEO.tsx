
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
