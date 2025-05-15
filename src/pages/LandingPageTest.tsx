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
            <h3 className="font-semibold text-lg sm:text-xl mb-1 text-gray-100">Suporte Exclusivo para Assinantes</h3>
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
            <h3 className="font-semibold text-lg sm:text-xl text-gray-100">Baixe o App e Crie Sua Conta</h3>
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
          Por tempo limitado, cadastre-se agora e ganhe 30 dias gratuitos para explorar todos os fornecedores!
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