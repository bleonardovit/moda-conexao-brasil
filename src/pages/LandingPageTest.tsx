import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const LandingPageTest: React.FC = () => {
  const navigate = useNavigate();

  // Estilo base para cards com efeito de vidro/blur
  const cardStyle = "bg-black/30 backdrop-blur-md p-6 rounded-xl border border-gray-700/60 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-pink-500/70 hover:scale-[1.02]";
  const sectionPadding = "py-16 md:py-20";
  const titleStyle = "text-3xl sm:text-4xl font-bold mb-8 md:mb-12 text-center";

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-800 via-black to-purple-900 text-gray-100 px-4 md:px-6 pt-24 sm:pt-28">
      <header className="absolute top-0 left-0 p-4 w-full bg-transparent z-20"> {/* Aumentado z-index caso haja sobreposição */}
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Os Fornecedores</h1>
        </div>
      </header>
      
      <section className={`text-center ${sectionPadding} w-full max-w-5xl mx-auto`}>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
          Encontre Fornecedores Confiáveis para o Seu Negócio de Moda!
        </h1>
        <p className="text-lg sm:text-xl mb-10 max-w-3xl mx-auto text-gray-300">
          Diga adeus ao medo de golpes e à falta de variedade. Cadastre-se e descubra fornecedores validados e recomendados!
        </p>
        <Button
          onClick={() => navigate('/auth/register')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-base sm:text-lg transform transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-pink-500/50"
        >
          Quero Acessar Agora!
        </Button>
        <div className="mt-16 px-4 sm:px-0">
          <img 
            src="/images/mosaico.png"
            alt="Modelos de roupas variadas demonstrando a plataforma"
            className="h-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto rounded-xl shadow-2xl object-cover border-2 border-pink-500/30"
          />
        </div>
      </section>
      
      <section className={`text-center ${sectionPadding} px-4 w-full max-w-5xl mx-auto`}>
        <h2 className={`${titleStyle} text-white`}>
          Empreender na Moda é Desafiador?
        </h2>
        <p className="text-lg sm:text-xl mb-12 md:mb-16 max-w-3xl mx-auto text-gray-300">
          Se você está começando um negócio de moda ou quer expandir suas opções de fornecedores, sabe o quanto é difícil encontrar parceiros confiáveis. O medo de golpes e a falta de variedade podem prejudicar seu crescimento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className={`${cardStyle} flex flex-col items-center`}>
            <span className="text-5xl mb-4">🚫</span>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Golpes e fornecedores falsos</h3>
          </div>
          <div className={`${cardStyle} flex flex-col items-center`}>
            <span className="text-5xl mb-4">❌</span>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Pouca variedade de produtos</h3>
          </div>
          <div className={`${cardStyle} flex flex-col items-center`}>
            <span className="text-5xl mb-4">🤔</span>
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Falta de suporte e informações claras</h3>
          </div>
        </div>
      </section>
      
      <section className={`${sectionPadding} px-4 w-full max-w-5xl mx-auto bg-purple-900/50 backdrop-blur-lg rounded-2xl my-10`}>
        <h2 className={`${titleStyle} text-pink-400`}>
          O App que Conecta Você aos Melhores Fornecedores!
        </h2>
        <p className="text-lg sm:text-xl text-center mb-12 md:mb-16 max-w-3xl mx-auto text-gray-200">
          Com nosso app, você acessa uma rede de fornecedores validados e recomendados por outros empreendedores. Segurança, variedade e facilidade em um só lugar!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { icon: "🔍", text: "Fornecedores Validados" },
            { icon: "📦", text: "Variedade de Produtos e Estilos" },
            { icon: "🌟", text: "Avaliações Reais de Usuários" },
            { icon: "💬", text: "Atualizações Semanais" },
          ].map((item, index) => (
            <div key={index} className={`${cardStyle} flex flex-col items-center`}>
              <span className="text-5xl mb-4">{item.icon}</span>
              <h3 className="font-semibold text-lg sm:text-xl text-gray-100">{item.text}</h3>
            </div>
          ))}
        </div>
      </section>
      
      <section className={`text-center ${sectionPadding} px-4 w-full max-w-5xl mx-auto`}>
        <h2 className={`${titleStyle} text-white`}>
          Veja o Que Nossos Usuários Dizem!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`${cardStyle} p-8`}> {/* Increased padding for testimonials */}
            <p className="text-lg italic mb-6 text-gray-300">
              "Graças ao app, encontrei fornecedores incríveis e seguros! Minhas vendas cresceram!"
            </p>
            <p className="font-semibold text-pink-400">- Maria, empreendedora de moda</p>
          </div>
          <div className={`${cardStyle} p-8`}> {/* Increased padding for testimonials */}
            <p className="text-lg italic mb-6 text-gray-300">
              "A confiança que eu precisava para negociar! O app me deu segurança e opções variadas."
            </p>
            <p className="font-semibold text-pink-400">- João, lojista</p>
          </div>
        </div>
      </section>

      <section className={`${sectionPadding} px-4 w-full max-w-5xl mx-auto bg-purple-900/50 backdrop-blur-lg rounded-2xl my-10`}>
        <h2 className={`${titleStyle} text-pink-400`}>
          Simples e Rápido!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-start text-center">
          {[
            { num: "1", text: "Acesse a Plataforma e Crie Sua Conta" },
            { num: "2", text: "Explore os Fornecedores e Leia Avaliações" },
            { num: "3", text: "Entre em Contato Direto com Segurança" },
          ].map((step) => (
            <div key={step.num} className="flex flex-col items-center p-4">
              <div className="bg-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mb-4 shadow-md">{step.num}</div>
              <h3 className="font-semibold text-lg sm:text-xl text-gray-100">{step.text}</h3>
            </div>
          ))}
        </div>
        <div className={`${cardStyle} h-56 sm:h-72 w-full max-w-md md:max-w-lg mx-auto flex items-center justify-center border-dashed border-gray-600`}>
          <p className="text-gray-400 text-base sm:text-lg p-2">[Vídeo Tutorial ou GIF de Uso Rápido]</p>
        </div>
      </section>

      {/* Seção Oferta Especial (Gatilho de Urgência) */}
      <section className={`text-center ${sectionPadding} px-4 w-full max-w-4xl mx-auto`}>
        <h2 className={`${titleStyle} text-white leading-tight`}>
          Garanta Seu Acesso com <span className="text-pink-400">Desconto Exclusivo!</span>
        </h2>
        <p className="text-lg sm:text-xl mb-6 text-gray-300">
          Por tempo limitado, de <span className="line-through text-gray-400">R$ 176,40</span> cadastre-se agora por somente
        </p>
        <p className="text-4xl sm:text-5xl font-bold text-pink-400 mb-8">R$ 87,00<span className="text-2xl text-gray-300">/Anual</span></p>
        <Button
          onClick={() => navigate('/auth/select-plan')}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg sm:text-xl transform transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-pink-500/50"
        >
          Quero Acessar Agora!
        </Button>
      </section>

      <section className={`text-center ${sectionPadding} px-4 w-full max-w-5xl mx-auto`}>
        <div className="max-w-3xl mx-auto">
          <h2 className={`${titleStyle} text-white`}>Nossa Garantia</h2>
          <p className="text-lg sm:text-xl mb-10 text-gray-300">
            "Estamos comprometidos com a segurança e a transparência. Todos os fornecedores são cuidadosamente verificados, e você conta com suporte completo para resolver qualquer dúvida!"
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className={`${cardStyle} flex items-center p-4 min-w-[280px] justify-center`}>
              <span className="text-3xl mr-3">✔️</span>
              <span className="font-semibold text-gray-100 text-lg">Fornecedores Verificados</span>
            </div>
            <div className={`${cardStyle} flex items-center p-4 min-w-[280px] justify-center`}>
              <span className="text-3xl mr-3">🔒</span>
              <span className="font-semibold text-gray-100 text-lg">Segurança nas Transações</span>
            </div>
          </div>
        </div>
      </section>
      
      <section className={`${sectionPadding} px-0 md:px-4 w-full`}> {/* Full width for scroll container */}
        <h2 className={`${titleStyle} text-white px-4`}>
          O que você vai encontrar na plataforma?
        </h2>
        
        <div className="flex overflow-x-auto space-x-6 pb-8 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:space-x-0 md:max-w-7xl md:mx-auto px-4 md:px-0 custom-scrollbar">
          {[
            { title: "Moda Plus Size", youtubeId: "W3lF47bX3to", desc: "Descubra fornecedores incríveis de moda plus size com peças modernas e confortáveis." },
            { title: "Moda Fitness", youtubeId: "YDG0MoazL-I", desc: "As melhores marcas e tendências em moda fitness para seus clientes se exercitarem com estilo." },
            { title: "Moda Evangélica", youtubeId: "lrrO6sGcwJg", desc: "Elegância e sofisticação em moda evangélica, com opções para todas as ocasiões." },
            { title: "Todos Estilos de Moda", youtubeId: "srYjExvc8S8", desc: "Peças ousadas e cheias de brilho para quem quer arrasar na noite. Encontre aqui!" },         
          ].map((videoItem, index) => (
            <div key={index} className={`flex-shrink-0 w-3/4 sm:w-2/3 md:w-full snap-center ${cardStyle}`}>
              <h3 className="text-xl font-semibold mb-3 text-pink-400">{videoItem.title}</h3>
              <div className="aspect-[9/16] w-full rounded-md overflow-hidden mb-3">
                <iframe
                  src={`https://www.youtube.com/embed/${videoItem.youtubeId}`}
                  title={videoItem.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{videoItem.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/auth/register')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg sm:text-xl transform transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-pink-500/50"
          >
            Quero ter acesso
          </Button>
        </div>
      </section>
      
      <section className={`${sectionPadding} px-4 w-full max-w-5xl mx-auto bg-purple-900/50 backdrop-blur-lg rounded-2xl my-10`}>
        <h2 className={`${titleStyle} text-pink-400`}>
          <span role="img" aria-label="ícone de presente" className="mr-2">🎁</span> Bônus Exclusivo: Área de Dicas & Conteúdos
        </h2>
        <p className="text-lg sm:text-xl text-center mb-6 max-w-3xl mx-auto text-gray-200">
          Assine agora e desbloqueie um conteúdo exclusivo para impulsionar o seu negócio de moda!
        </p>
        <p className="text-lg sm:text-xl text-center mb-10 max-w-3xl mx-auto text-gray-300">
          Ao se tornar assinante da nossa plataforma, você ganha acesso à Área de Dicas & Conteúdos, um espaço dedicado a fornecer insights práticos e diretos sobre:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 max-w-4xl mx-auto">
          {[
            { title: "Tráfego Pago", desc: "Aprenda estratégias eficazes para atrair mais clientes através de anúncios online." },
            { title: "Gestão de Negócios", desc: "Descubra técnicas para organizar e otimizar a operação do seu empreendimento." },
            { title: "Empreendedorismo", desc: "Inspire-se com histórias e dicas para desenvolver uma mentalidade empreendedora de sucesso." },
            { title: "Finanças", desc: "Entenda como gerenciar melhor o fluxo de caixa e maximizar os lucros." },
          ].map((bonus, index) => (
             <div key={index} className={`${cardStyle} p-6`}> {/* Re-applying cardStyle or a variant */}
              <h3 className="font-semibold text-xl mb-2 text-white">{bonus.title}</h3>
              <p className="text-gray-300 leading-relaxed">{bonus.desc}</p>
            </div>
          ))}
        </div>
        <h3 className="text-2xl font-semibold mb-6 text-center text-white">Por que este bônus é imperdível?</h3>
        <ul className="space-y-4 text-gray-300 list-none mb-10 max-w-2xl mx-auto text-left sm:text-center">
          {[
            "Conteúdo Prático: Sem enrolação, focado em ações que você pode implementar imediatamente.",
            "Atualizações Frequentes: Novos conteúdos adicionados regularmente para mantê-lo sempre informado.",
            "Especialistas no Setor: Dicas elaboradas por uma equipe que acompanha o mercado de moda.",
          ].map((item, index) => (
            <li key={index} className="flex items-start sm:items-center sm:justify-center">
              <span className="text-pink-400 mr-3 text-xl">✔️</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-lg sm:text-xl font-semibold mb-8 text-center text-white">
          Não perca esta oportunidade de transformar seu negócio.
        </p>
        <div className="text-center">
            <Button
              onClick={() => navigate('/auth/select-plan')} 
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-9 px-6 sm:py-9 sm:px-8 rounded-lg text-lg sm:text-xl w-full max-w-md sm:max-w-lg mx-auto break-words leading-tight transform transition-transform duration-200 hover:scale-105 shadow-lg hover:shadow-pink-500/50"
            >
              Assine agora e aproveite <br /> este bônus exclusivo!
            </Button>
        </div>
      </section>

      {/* Seção Dúvidas Frequentes */}
      <section className={`text-left ${sectionPadding} px-4 w-full max-w-4xl mx-auto`}>
        <h2 className={`${titleStyle} text-white`}>
          <span role="img" aria-label="ícone de interrogação" className="mr-2">❓</span> Dúvidas Frequentes
        </h2>
        <div className="space-y-6">
          {[
            { q: "1. Os fornecedores são realmente confiáveis?", a: "Sim! Todos os fornecedores disponíveis na plataforma são previamente verificados por nossa equipe. Trabalhamos apenas com parceiros que possuem histórico sólido no mercado de moda, garantindo segurança e qualidade para o seu negócio." },
            { q: "2. De onde são os fornecedores da plataforma?", a: "Atualmente, contamos com fornecedores das principais regiões do Brasil, incluindo São Paulo, Goiânia, Fortaleza e Pernambuco. Essa diversidade regional permite uma ampla variedade de estilos e produtos para atender às suas necessidades." },
            { q: "3. Após o pagamento, em quanto tempo terei acesso à plataforma?", a: "A liberação do acesso é imediata após a confirmação do pagamento. Você receberá um e-mail com as instruções para começar a explorar todos os recursos disponíveis." },
            { q: "4. Vou receber um PDF com as informações?", a: "Não! Nossa plataforma é dinâmica e interativa, com atualizações frequentes e uma comunidade ativa de vendedoras que compartilham avaliações e comentários sobre os fornecedores. Isso proporciona uma experiência muito mais rica e atualizada do que um PDF estático." },
            { q: "5. Por quanto tempo terei acesso à plataforma?", a: "Oferecemos dois tipos de planos:\nPlano Anual: Acesso por 12 meses, com renovação anual.\nPlano Mensal: Acesso contínuo enquanto a assinatura estiver ativa." },
            { q: "6. Preciso ter CNPJ para comprar dos fornecedores?", a: "Não! A maioria dos fornecedores aceita compras com CPF. Alguns podem solicitar CNPJ, mas essa não é uma exigência geral na plataforma." },
            { q: "7. Quais tipos de fornecedores encontrarei na plataforma?", a: "Você terá acesso a uma variedade de fornecedores especializados em diversos segmentos, como:\nModa Plus Size\nModa Fitness\nModa Balada\nModa Evangélica\nE muitos outros." },
            { q: "8. A plataforma oferece suporte ao usuário?", a: "Sim! Disponibilizamos suporte dedicado para auxiliá-lo em suas negociações e no uso da plataforma, garantindo que você aproveite ao máximo todos os recursos disponíveis." },
            { q: "9. Os conteúdos da área de dicas são atualizados regularmente?", a: "Sim! Nossa equipe atualiza constantemente a área de conteúdos, trazendo as informações mais recentes e relevantes sobre tráfego pago, empreendedorismo, finanças e gestão para impulsionar o seu negócio de moda." },
            { q: "10. Como posso cancelar minha assinatura?", a: "Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta, de forma simples e sem burocracia." }
          ].map((faq, index) => (
            <div key={index} className={`${cardStyle} p-6`}>
              <h3 className="font-semibold text-lg sm:text-xl mb-3 text-pink-400">
                {faq.q}
              </h3>
              <p className="text-gray-300 text-base sm:text-lg whitespace-pre-line leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
      
      <footer className={`w-full bg-black/60 backdrop-blur-lg text-gray-300 p-8 sm:p-10 text-center mt-16 border-t border-gray-700/50`}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Links Úteis</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/legal/terms')} className="text-gray-300 hover:text-pink-400 transition-colors">Termos de Uso</button></li>
              <li><button onClick={() => navigate('/legal/privacy')} className="text-gray-300 hover:text-pink-400 transition-colors">Política de Privacidade</button></li>
              <li><button onClick={() => navigate('/legal/cookies')} className="text-gray-300 hover:text-pink-400 transition-colors">Política de Cookies</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Redes Sociais</h5>
            <div className="flex justify-center space-x-6 text-3xl">
              <a href="#" aria-label="Instagram" className="hover:text-pink-400 transition-colors transform hover:scale-110"><span role="img" aria-label="Instagram">📸</span></a>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Segurança</h5>
            <div className="flex items-center justify-center bg-black/30 p-4 rounded-lg border border-gray-700/50">
              <span className="text-2xl mr-2">🛡️</span>
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
