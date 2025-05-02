
import { Article, ArticleCategory } from '@/types/article';

// Dados de exemplo para artigos
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Como otimizar suas campanhas de Facebook Ads',
    summary: 'Aprenda estratégias avançadas para melhorar o desempenho de suas campanhas de Facebook Ads e reduzir o custo por aquisição.',
    content: `
      <h2>Otimizando suas campanhas de Facebook Ads</h2>
      <p>O Facebook Ads continua sendo uma das plataformas mais poderosas para aquisição de clientes. No entanto, muitos empreendedores desperdiçam orçamento por não compreenderem completamente como otimizar suas campanhas.</p>
      <h3>1. Segmentação precisa</h3>
      <p>A segmentação é a chave para o sucesso. Quanto mais específico for seu público-alvo, melhor será o desempenho da campanha. Utilize os recursos de segmentação avançada do Facebook para definir características demográficas, interesses e comportamentos.</p>
      <h3>2. Teste A/B constante</h3>
      <p>Nunca pare de testar diferentes elementos em seus anúncios: imagens, títulos, textos e chamadas para ação. O Facebook facilita a realização de testes A/B, permitindo identificar o que realmente funciona para seu público.</p>
      <h3>3. Análise de métricas relevantes</h3>
      <p>Não se fixe apenas no custo por clique. Acompanhe métricas como taxa de conversão, retorno sobre investimento (ROI) e valor do tempo de vida do cliente (LTV).</p>
      <h3>4. Otimização para valor</h3>
      <p>Configure suas campanhas para otimizar valor, não apenas para cliques ou impressões. O algoritmo do Facebook é incrivelmente eficiente em encontrar pessoas propensas a realizar ações valiosas para seu negócio.</p>
      <p>Implementando essas estratégias, você verá uma melhoria significativa no desempenho de suas campanhas de Facebook Ads, reduzindo custos e aumentando resultados.</p>
    `,
    category: 'traffic',
    author: 'Ana Silva',
    created_at: '2025-04-15T14:30:00Z'
  },
  {
    id: '2',
    title: 'Estratégias para aumentar engajamento no Instagram',
    summary: 'Descubra técnicas comprovadas para aumentar o engajamento do seu perfil no Instagram e converter seguidores em clientes.',
    content: `
      <h2>Aumentando o engajamento no Instagram</h2>
      <p>O Instagram é uma das plataformas mais poderosas para construção de marca e relacionamento com clientes. Aumentar o engajamento é fundamental para o sucesso da sua estratégia.</p>
      <h3>1. Conteúdo autêntico e relevante</h3>
      <p>A autenticidade é valorizada pelos usuários do Instagram. Crie conteúdo que reflita a personalidade da sua marca e adicione valor real para sua audiência.</p>
      <h3>2. Consistência nas postagens</h3>
      <p>Mantenha um calendário regular de postagens. A consistência ajuda a manter seu público engajado e favorece o algoritmo da plataforma.</p>
      <h3>3. Utilize todos os formatos</h3>
      <p>Explore todos os formatos disponíveis: feed, Stories, Reels e IGTV. Cada formato tem suas particularidades e alcança diferentes segmentos do seu público.</p>
      <h3>4. Interação ativa</h3>
      <p>Responda comentários, interaja com seu público e participe de conversas relevantes. O Instagram prioriza contas que demonstram engajamento genuíno.</p>
      <p>Com estas estratégias implementadas de forma consistente, você verá um aumento significativo no engajamento do seu perfil, fortalecendo sua presença digital e convertendo mais seguidores em clientes.</p>
    `,
    category: 'instagram',
    author: 'Carlos Mendes',
    created_at: '2025-04-10T09:15:00Z'
  },
  {
    id: '3',
    title: 'Como precificar produtos no seu negócio',
    summary: 'Um guia completo sobre como definir preços estratégicos para seus produtos e serviços, maximizando lucros sem afastar clientes.',
    content: `
      <h2>A arte de precificar produtos e serviços</h2>
      <p>A precificação é uma das decisões mais importantes para qualquer empreendedor. Um preço muito alto pode afastar clientes, enquanto um preço muito baixo pode comprometer a saúde financeira do seu negócio.</p>
      <h3>1. Entenda seus custos</h3>
      <p>Antes de definir preços, é fundamental conhecer todos os custos envolvidos: matéria-prima, mão de obra, custos fixos, impostos e margem de lucro desejada.</p>
      <h3>2. Analise o mercado</h3>
      <p>Estude os preços praticados pela concorrência, mas não se limite a copiá-los. Considere o posicionamento do seu produto e o valor percebido pelos clientes.</p>
      <h3>3. Valor percebido vs. Custo real</h3>
      <p>O valor que os clientes estão dispostos a pagar muitas vezes está mais relacionado ao valor percebido do que ao custo real. Invista em branding e na comunicação de benefícios.</p>
      <h3>4. Experimente diferentes estratégias</h3>
      <p>Teste diferentes estratégias de preço: premium, penetração de mercado, baseado em valor ou pacotes. Monitore os resultados e ajuste conforme necessário.</p>
      <p>Com uma estratégia de preços bem definida, você conseguirá maximizar seus lucros enquanto mantém seu produto competitivo no mercado.</p>
    `,
    category: 'finance',
    author: 'Mariana Costa',
    created_at: '2025-04-05T16:45:00Z'
  },
  {
    id: '4',
    title: 'Produtividade para empreendedores',
    summary: 'Técnicas e ferramentas para otimizar seu tempo e aumentar sua produtividade como empreendedor.',
    content: `
      <h2>Maximizando a produtividade no empreendedorismo</h2>
      <p>Empreendedores frequentemente se veem sobrecarregados com múltiplas responsabilidades. Otimizar a produtividade é essencial para o crescimento sustentável do negócio.</p>
      <h3>1. Planejamento estratégico</h3>
      <p>Dedique tempo para planejar sua semana. Identifique as atividades de alto impacto e priorize-as em seu calendário.</p>
      <h3>2. Técnica Pomodoro</h3>
      <p>Trabalhe em blocos focados de 25 minutos, seguidos por pausas curtas de 5 minutos. Esta técnica ajuda a manter a concentração e evitar a fadiga mental.</p>
      <h3>3. Delegação eficiente</h3>
      <p>Identifique tarefas que podem ser delegadas. Focar apenas nas atividades que exigem suas habilidades únicas multiplica sua produtividade.</p>
      <h3>4. Ferramentas digitais</h3>
      <p>Utilize ferramentas como Trello, Asana, Notion ou ClickUp para gerenciar projetos e tarefas. A organização digital reduz o estresse e aumenta a eficiência.</p>
      <p>Implementando estas estratégias, você conseguirá realizar mais em menos tempo, mantendo o equilíbrio necessário para sustentar o crescimento do seu negócio.</p>
    `,
    category: 'management',
    author: 'Rafael Oliveira',
    created_at: '2025-03-28T10:20:00Z'
  },
  {
    id: '5',
    title: 'Construindo uma marca memorável',
    summary: 'Estratégias de branding para pequenos negócios que desejam se destacar em mercados competitivos.',
    content: `
      <h2>O poder do branding para pequenos negócios</h2>
      <p>Uma marca forte é um dos ativos mais valiosos para qualquer empresa, independente do seu tamanho. Para pequenos negócios, um branding eficaz pode ser o diferencial competitivo.</p>
      <h3>1. Propósito claro</h3>
      <p>Defina o propósito do seu negócio além do lucro. Marcas que se conectam a propósitos maiores criam vínculos emocionais mais fortes com seus clientes.</p>
      <h3>2. Identidade visual consistente</h3>
      <p>Desenvolva uma identidade visual coerente e aplique-a em todos os pontos de contato com o cliente. Consistência visual fortalece o reconhecimento da marca.</p>
      <h3>3. Tom de voz único</h3>
      <p>Estabeleça um tom de voz que reflita a personalidade da sua marca. A forma como você se comunica é tão importante quanto o que você comunica.</p>
      <h3>4. Experiência do cliente</h3>
      <p>Cada interação é uma oportunidade de branding. Desenhe cuidadosamente a experiência do cliente desde o primeiro contato até o pós-venda.</p>
      <p>Com estas estratégias implementadas de forma consistente, sua marca se tornará mais memorável, construindo uma base sólida para o crescimento sustentável do seu negócio.</p>
    `,
    category: 'marketing',
    author: 'Juliana Mendes',
    created_at: '2025-03-20T13:40:00Z'
  },
  {
    id: '6',
    title: 'Como validar sua ideia de negócio',
    summary: 'Aprenda métodos práticos para validar sua ideia de negócio antes de investir tempo e dinheiro.',
    content: `
      <h2>Validando ideias de negócio com eficiência</h2>
      <p>Muitos empreendedores falham por investir recursos em ideias não validadas. Aprender a testar sua ideia antes de escalar pode ser a diferença entre sucesso e fracasso.</p>
      <h3>1. Problema real</h3>
      <p>Confirme que sua ideia resolve um problema real. Entreviste potenciais clientes para entender suas dores e necessidades genuínas.</p>
      <h3>2. MVP (Produto Mínimo Viável)</h3>
      <p>Crie uma versão simplificada do seu produto ou serviço que entregue valor central. O MVP permite testar sua ideia com investimento mínimo.</p>
      <h3>3. Pré-venda</h3>
      <p>Ofereça seu produto ou serviço antes mesmo de tê-lo completamente desenvolvido. Clientes dispostos a pagar antecipadamente são um forte indicador de demanda real.</p>
      <h3>4. Métricas claras</h3>
      <p>Defina métricas objetivas para avaliar o sucesso da sua validação: conversão, retenção, NPS ou outras métricas relevantes para seu modelo de negócio.</p>
      <p>Validar sua ideia antes de escalar permite pivotear com agilidade, economizando recursos e aumentando significativamente suas chances de sucesso.</p>
    `,
    category: 'entrepreneurship',
    author: 'Pedro Almeida',
    created_at: '2025-03-15T08:30:00Z'
  }
];

export const getArticles = (category?: ArticleCategory): Article[] => {
  if (!category) return [...mockArticles];
  return mockArticles.filter(article => article.category === category);
};

export const getArticleById = (id: string): Article | undefined => {
  return mockArticles.find(article => article.id === id);
};

export const createArticle = (article: Omit<Article, 'id' | 'created_at'>): Article => {
  const newArticle: Article = {
    ...article,
    id: `${mockArticles.length + 1}`,
    created_at: new Date().toISOString()
  };
  
  mockArticles.push(newArticle);
  return newArticle;
};

export const updateArticle = (id: string, articleData: Partial<Article>): Article | undefined => {
  const index = mockArticles.findIndex(article => article.id === id);
  if (index === -1) return undefined;
  
  mockArticles[index] = { ...mockArticles[index], ...articleData };
  return mockArticles[index];
};

export const deleteArticle = (id: string): boolean => {
  const initialLength = mockArticles.length;
  const filteredArticles = mockArticles.filter(article => article.id !== id);
  
  if (filteredArticles.length === initialLength) return false;
  
  mockArticles.length = 0;
  mockArticles.push(...filteredArticles);
  return true;
};
