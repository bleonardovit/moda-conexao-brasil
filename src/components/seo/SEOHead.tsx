
import React from 'react';
// import { Helmet } from 'react-helmet'; // Temporariamente desabilitado
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
  // const { seoSettings } = useSEOSettings(); // Temporariamente desabilitado

  // SEO dinâmico temporariamente desabilitado para evitar erros com Symbols
  // O SEO estático no index.html continuará funcionando
  console.log('SEO dinâmico temporariamente desabilitado', {
    title,
    description,
    image,
    url,
    type
  });

  // Retorna um fragmento vazio - o SEO estático do index.html será usado
  return <></>;

  /* Código do Helmet temporariamente comentado
  const defaultTitle = "Os Fornecedores - Encontre os Melhores Fornecedores de Moda do Brasil";
  const defaultDescription = "Acesse uma rede exclusiva de fornecedores verificados para impulsionar seu negócio de moda. Conecte-se aos melhores fornecedores do Brasil.";
  const defaultImage = "/images/mosaico.png";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://fornecedores.lovable.app';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
  */
};
