
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="ml-2 font-bold text-xl text-gray-900">Conexão Brasil</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">🍪 Política de Cookies</h1>
            <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. O que são cookies?</h2>
              <p className="text-gray-700 mb-6">
                Cookies são pequenos arquivos armazenados no seu navegador que nos ajudam a entender o seu comportamento de navegação, oferecer melhor experiência e entregar conteúdo mais relevante.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tipos de Cookies que Utilizamos</h2>
              <div className="text-gray-700 mb-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Essenciais:</h3>
                  <p>Necessários para funcionamento básico da plataforma;</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Análise e Desempenho:</h3>
                  <p>Para entender como os usuários interagem com a plataforma (Google Analytics, Hotjar etc.);</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Publicidade:</h3>
                  <p>Utilizados para personalização de anúncios (Facebook Pixel e similares).</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Gerenciamento de Cookies</h2>
              <p className="text-gray-700 mb-6">
                Você pode, a qualquer momento, configurar seu navegador para recusar o uso de cookies, porém isso pode afetar a funcionalidade da plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Consentimento</h2>
              <p className="text-gray-700">
                Ao utilizar a plataforma, você concorda com o uso de cookies conforme descrito nesta política.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 border-t">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} Conexão Brasil. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;
