import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const LandingPageTest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-800 via-black to-purple-900 text-gray-100 p-4 pt-20 md:pt-4">
      <header className="absolute top-0 left-0 p-4 w-full bg-transparent z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Os Fornecedores</h1>
      </header>
      
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20 w-full max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 px-2 text-white">
          Encontre Fornecedores Confiáveis para o Seu Negócio de Moda!
        </h1>
        <p className="text-lg sm:text-xl mb-8 px-4 sm:px-2 text-gray-300">
          Diga adeus ao medo de golpes e à falta de variedade. Cadastre-se e descubra fornecedores validados e recomendados!
        </p>
        <Button
          onClick={() => alert('CTA Clicado!')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 rounded-lg text-base sm:text-lg"
        >
          Quero Acessar Agora!
        </Button>
        <div className="mt-10 px-4 sm:px-0">
          {/* Imagem da Hero Section */}
          <img 
            src="/images/mosaico.png"
            alt="Modelos de roupas variadas demonstrando a plataforma"
            className="h-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto rounded-lg shadow-2xl object-cover"
          />
        </div>
      </section>
      
      {/* Seção Problema e Dor do Cliente */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
          Empreender na Moda é Desafiador?
        </h2>
        <p className="text-lg sm:text-xl mb-8 md:mb-12 max-w-3xl mx-auto text-gray-300">
          Se você está começando um negócio de moda ou quer expandir suas opções de fornecedores, sabe o quanto é difícil encontrar parceiros confiáveis. O medo de golpes e a falta de variedade podem prejudicar seu crescimento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="flex flex-col items-center p-4 rounded-lg bg-black/20 backdrop-blur-sm">
            <span className="text-4xl mb-3">🚫</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Golpes e fornecedores falsos</h3>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-black/20 backdrop-blur-sm">
            <span className="text-4xl mb-3">❌</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Pouca variedade de produtos</h3>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg bg-black/20 backdrop-blur-sm">
            <span className="text-4xl mb-3">🤔</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Falta de suporte e informações claras</h3>
          </div>
        </div>
      </section>
      
      {/* Seção Apresentação da Solução (Sobre o App) */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto bg-purple-900/40 backdrop-blur-md rounded-lg my-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-pink-400">
          O App que Conecta Você aos Melhores Fornecedores!
        </h2>
        <p className="text-lg sm:text-xl mb-8 md:mb-12 max-w-3xl mx-auto text-gray-200">
          Com nosso app, você acessa uma rede de fornecedores validados e recomendados por outros empreendedores. Segurança, variedade e facilidade em um só lugar!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="flex flex-col items-center p-4 rounded-lg">
            <span className="text-4xl mb-3">🔍</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Fornecedores Validados</h3>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg">
            <span className="text-4xl mb-3">📦</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Variedade de Produtos e Estilos</h3>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg">
            <span className="text-4xl mb-3">🌟</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Avaliações Reais de Usuários</h3>
          </div>
          <div className="flex flex-col items-center p-4 rounded-lg">
            <span className="text-4xl mb-3">💬</span>
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Atualizações Semanais</h3>
          </div>
        </div>
      </section>
      
      {/* Seção Depoimentos de Sucesso */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 md:mb-12 text-white">
          Veja o Que Nossos Usuários Dizem!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <p className="text-lg italic mb-4 text-gray-300">
              "Graças ao app, encontrei fornecedores incríveis e seguros! Minhas vendas cresceram!"
            </p>
            <p className="font-semibold text-pink-400">- Maria, empreendedora de moda</p>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg">
            <p className="text-lg italic mb-4 text-gray-300">
              "A confiança que eu precisava para negociar! O app me deu segurança e opções variadas."
            </p>
            <p className="font-semibold text-pink-400">- João, lojista</p>
          </div>
        </div>
      </section>

      {/* Seção Demonstração Rápida (Como Funciona) */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto bg-purple-900/40 backdrop-blur-md rounded-lg my-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 md:mb-12 text-pink-400">
          Simples e Rápido!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 items-start">
          <div className="flex flex-col items-center">
            <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-3">1</div>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Acesse a Plataforma e Crie Sua Conta</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-3">2</div>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Explore os Fornecedores e Leia Avaliações</h3>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-3">3</div>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Entre em Contato Direto com Segurança</h3>
          </div>
        </div>
        {/* Placeholder para Vídeo Tutorial ou GIF */}
        <div className="bg-black/30 backdrop-blur-sm h-48 sm:h-64 w-full max-w-md md:max-w-lg mx-auto rounded-lg flex items-center justify-center">
          <p className="text-gray-400 text-sm sm:text-base p-2">[Vídeo Tutorial ou GIF de Uso Rápido]</p>
        </div>
      </section>

      {/* Seção Oferta Especial (Gatilho de Urgência) */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
          Garanta Seu Acesso com Desconto!
        </h2>
        <p className="text-lg sm:text-xl mb-8 text-gray-300">
          Por tempo limitado, de R$ 116,40 cadastre-se agora por somente R$ 87,00/Anual, para explorar todos os fornecedores!
        </p>
        <Button
          onClick={() => alert('CTA Oferta Clicado!')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl"
        >
          Quero Acessar Agora!
        </Button>
      </section>

      {/* Seção Garantia de Segurança */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <p className="text-lg sm:text-xl mb-8 text-gray-300">
            "Estamos comprometidos com a segurança e a transparência. Todos os fornecedores são cuidadosamente verificados, e você conta com suporte completo para resolver qualquer dúvida!"
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <div className="flex items-center bg-black/20 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-2xl mr-2">✔️</span>
              <span className="font-semibold text-gray-100">Fornecedores Verificados</span>
            </div>
            <div className="flex items-center bg-black/20 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-2xl mr-2">🔒</span>
              <span className="font-semibold text-gray-100">Segurança nas Transações</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção O que você vai encontrar na plataforma? */}
      <section className="py-12 md:py-16 px-4 w-full">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 md:mb-12 text-center text-white">
          O que você vai encontrar na plataforma?
        </h2>
        
        {/* Contêiner do "Carrossel" de Vídeos */}
        {/* Em mobile: scroll horizontal. Em desktop: grid. */}
        {/* Para um carrossel interativo real, considere bibliotecas como Swiper.js ou react-slick */}
        <div className="flex overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:space-x-0 md:max-w-6xl md:mx-auto">
          
          {/* Vídeo 1: Moda Plus Size */}
          <div className="flex-shrink-0 w-3/4 sm:w-1/2 md:w-full snap-center bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2 text-pink-400">Moda Plus Size</h3>
            <div className="aspect-[9/16] w-full bg-gray-700 rounded flex items-center justify-center mb-2">
              {<video src="/videos/0516.mp4" controls className="w-full h-full rounded object-cover"></video> }
              <p className="text-gray-400 text-xs">Vídeo 9:16</p>
            </div>
            <p className="text-sm text-gray-300">Descubra fornecedores incríveis de moda plus size com peças modernas e confortáveis.</p>
          </div>

          {/* Vídeo 2: Moda Fitness */}
          <div className="flex-shrink-0 w-3/4 sm:w-1/2 md:w-full snap-center bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2 text-pink-400">Moda Fitness</h3>
            <div className="aspect-[9/16] w-full bg-gray-700 rounded flex items-center justify-center mb-2">
              { <video src="/videos/0516.mp4" controls className="w-full h-full rounded object-cover"></video> }
              <p className="text-gray-400 text-xs">Vídeo 9:16</p>
            </div>
            <p className="text-sm text-gray-300">As melhores marcas e tendências em moda fitness para seus clientes se exercitarem com estilo.</p>
          </div>

          {/* Vídeo 3: Moda Balada */}
          <div className="flex-shrink-0 w-3/4 sm:w-1/2 md:w-full snap-center bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2 text-pink-400">Moda Balada</h3>
            <div className="aspect-[9/16] w-full bg-gray-700 rounded flex items-center justify-center mb-2">
              { <video src="/videos/0516.mp4" controls className="w-full h-full rounded object-cover"></video> }
              <p className="text-gray-400 text-xs">Vídeo 9:16</p>
            </div>
            <p className="text-sm text-gray-300">Peças ousadas e cheias de brilho para quem quer arrasar na noite. Encontre aqui!</p>
          </div>

          {/* Vídeo 4: Moda Evangélica */}
          <div className="flex-shrink-0 w-3/4 sm:w-1/2 md:w-full snap-center bg-black/30 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2 text-pink-400">Moda Evangélica</h3>
            <div className="aspect-[9/16] w-full bg-gray-700 rounded flex items-center justify-center mb-2">
              { <video src="/videos/0516.mp4" controls className="w-full h-full rounded object-cover"></video>}
              <p className="text-gray-400 text-xs">Vídeo 9:16</p>
            </div>
            <p className="text-sm text-gray-300">Elegância e sofisticação em moda evangélica, com opções para todas as ocasiões.</p>
          </div>

        </div>

        <div className="text-center mt-10">
          <Button
            onClick={() => alert('CTA "Quero ter acesso" Clicado!')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-lg sm:text-xl"
          >
            Quero ter acesso
          </Button>
        </div>
      </section>
      
      {/* Seção Bônus Exclusivo */}
      <section className="text-center py-12 md:py-16 px-4 w-full max-w-4xl mx-auto bg-purple-900/40 backdrop-blur-md rounded-lg my-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-pink-400">
          <span role="img" aria-label="ícone de presente">🎁</span> Bônus Exclusivo: Acesso à Área de Dicas & Conteúdos
        </h2>
        <p className="text-lg sm:text-xl mb-8 md:mb-12 max-w-3xl mx-auto text-gray-200">
          Assine agora e desbloqueie um conteúdo exclusivo para impulsionar o seu negócio de moda!
        </p>
        <p className="text-lg sm:text-xl mb-8 md:mb-12 max-w-3xl mx-auto text-gray-300">
          Ao se tornar assinante da nossa plataforma, você ganha acesso à Área de Dicas & Conteúdos, um espaço dedicado a fornecer insights práticos e diretos sobre:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left mb-8 max-w-3xl mx-auto">
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-white">Tráfego Pago</h3>
            <p className="text-gray-300">Aprenda estratégias eficazes para atrair mais clientes através de anúncios online.</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-white">Gestão de Negócios</h3>
            <p className="text-gray-300">Descubra técnicas para organizar e otimizar a operação do seu empreendimento.</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-white">Empreendedorismo</h3>
            <p className="text-gray-300">Inspire-se com histórias e dicas para desenvolver uma mentalidade empreendedora de sucesso.</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-white">Finanças</h3>
            <p className="text-gray-300">Entenda como gerenciar melhor o fluxo de caixa e maximizar os lucros.</p>
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-4 text-white">Por que este bônus é imperdível?</h3>
        <ul className="space-y-3 text-gray-300 list-none mb-8 max-w-2xl mx-auto text-left sm:text-center">
          <li><span className="text-pink-400 mr-2">✔️</span>Conteúdo Prático: Sem enrolação, focado em ações que você pode implementar imediatamente.</li>
          <li><span className="text-pink-400 mr-2">✔️</span>Atualizações Frequentes: Novos conteúdos adicionados regularmente para mantê-lo sempre informado.</li>
          <li><span className="text-pink-400 mr-2">✔️</span>Especialistas no Setor: Dicas elaboradas por uma equipe que acompanha o mercado de moda.</li>
        </ul>
        <p className="text-lg sm:text-xl font-semibold mb-6 text-white">
          Não perca esta oportunidade de transformar seu negócio.
        </p>
        <Button
          onClick={() => alert('CTA Assine Agora Bônus Clicado!')} 
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-9 px-4 sm:px-8 rounded-lg text-lg sm:text-xl w-full max-w-[360px] sm:w-auto sm:max-w-none break-words"
        >
          Assine agora e aproveite <br /> este bônus exclusivo!
        </Button>
      </section>

      {/* Seção Dúvidas Frequentes */}
      <section className="text-left py-12 md:py-16 px-4 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 md:mb-12 text-center text-white">
          <span role="img" aria-label="ícone de interrogação">❓</span> Dúvidas Frequentes
        </h2>
        <div className="space-y-6">
          {/* Pergunta 1 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              1. Os fornecedores são realmente confiáveis?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Sim! Todos os fornecedores disponíveis na plataforma são previamente verificados por nossa equipe. Trabalhamos apenas com parceiros que possuem histórico sólido no mercado de moda, garantindo segurança e qualidade para o seu negócio.
            </p>
          </div>

          {/* Pergunta 2 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              2. De onde são os fornecedores da plataforma?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Atualmente, contamos com fornecedores das principais regiões do Brasil, incluindo São Paulo, Goiânia, Fortaleza e Pernambuco. Essa diversidade regional permite uma ampla variedade de estilos e produtos para atender às suas necessidades.
            </p>
          </div>

          {/* Pergunta 3 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              3. Após o pagamento, em quanto tempo terei acesso à plataforma?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              A liberação do acesso é imediata após a confirmação do pagamento. Você receberá um e-mail com as instruções para começar a explorar todos os recursos disponíveis.
            </p>
          </div>

          {/* Pergunta 4 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              4. Vou receber um PDF com as informações?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Não! Nossa plataforma é dinâmica e interativa, com atualizações frequentes e uma comunidade ativa de vendedoras que compartilham avaliações e comentários sobre os fornecedores. Isso proporciona uma experiência muito mais rica e atualizada do que um PDF estático.
            </p>
          </div>

          {/* Pergunta 5 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              5. Por quanto tempo terei acesso à plataforma?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Oferecemos dois tipos de planos:
              <br />
              Plano Anual: Acesso por 12 meses, com renovação anual.
              <br />
              Plano Mensal: Acesso contínuo enquanto a assinatura estiver ativa.
            </p>
          </div>

          {/* Pergunta 6 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              6. Preciso ter CNPJ para comprar dos fornecedores?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Não! A maioria dos fornecedores aceita compras com CPF. Alguns podem solicitar CNPJ, mas essa não é uma exigência geral na plataforma.
            </p>
          </div>

          {/* Pergunta 7 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              7. Quais tipos de fornecedores encontrarei na plataforma?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Você terá acesso a uma variedade de fornecedores especializados em diversos segmentos, como:
              <br />
              Moda Plus Size
              <br />
              Moda Fitness
              <br />
              Moda Balada
              <br />
              Moda Evangélica
              <br />
              E muitos outros.
            </p>
          </div>

          {/* Pergunta 8 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              8. A plataforma oferece suporte ao usuário?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Sim! Disponibilizamos suporte dedicado para auxiliá-lo em suas negociações e no uso da plataforma, garantindo que você aproveite ao máximo todos os recursos disponíveis.
            </p>
          </div>

          {/* Pergunta 9 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              9. Os conteúdos da área de dicas são atualizados regularmente?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Sim! Nossa equipe atualiza constantemente a área de conteúdos, trazendo as informações mais recentes e relevantes sobre tráfego pago, empreendedorismo, finanças e gestão para impulsionar o seu negócio de moda.
            </p>
          </div>

          {/* Pergunta 10 */}
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-pink-400">
              10. Como posso cancelar minha assinatura?
            </h3>
            <p className="text-gray-300 text-base sm:text-lg">
              Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta, de forma simples e sem burocracia.
            </p>
          </div>
        </div>
      </section>
      
      <main className="text-center py-10 w-full max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white">Landing Page de Teste</h2>
        <p className="text-lg sm:text-xl mb-8 px-4 sm:px-2 text-gray-300">
          Esta é uma página de destino secundária para fins de teste e desenvolvimento.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
          >
            Voltar para Landing Page Principal
          </Button>
          <Button 
            onClick={() => navigate('/home')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Ir para Home (se logado)
          </Button>
        </div>
      </main>
      
      {/* Rodapé Novo */}
      <footer className="w-full bg-black/50 backdrop-blur-md text-gray-300 p-6 sm:p-8 text-center mt-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h5 className="font-bold text-lg mb-3 text-white">Links Úteis</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-pink-400">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-pink-400">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-pink-400">Contato</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-3 text-white">Redes Sociais</h5>
            <div className="flex justify-center space-x-4 text-2xl">
              <a href="#" aria-label="Instagram" className="hover:text-pink-400">
                <span role="img" aria-label="Instagram">📸</span>
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-pink-400">
                <span role="img" aria-label="Facebook">📘</span>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-pink-400">
                <span role="img" aria-label="LinkedIn">🔗</span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-3 text-white">Segurança</h5>
            <div className="flex items-center justify-center bg-black/20 p-3 rounded-lg">
              <span className="text-xl mr-2">🛡️</span>
              <span className="font-semibold text-gray-100">Site Seguro</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Moda Conexão Brasil. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPageTest; 