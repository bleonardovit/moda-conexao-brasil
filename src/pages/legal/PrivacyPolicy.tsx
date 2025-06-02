
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">🔐 Política de Privacidade</h1>
            <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Coleta de Dados</h2>
              <p className="text-gray-700 mb-6">
                Coletamos informações fornecidas diretamente por você no cadastro, bem como dados de navegação como IP, localização aproximada e interações dentro da plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso das Informações</h2>
              <p className="text-gray-700 mb-4">As informações coletadas são utilizadas para:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Melhorar a experiência do usuário;</li>
                <li>Personalizar conteúdos e recomendações;</li>
                <li>Monitorar tentativas de acesso indevido ou uso irregular da plataforma;</li>
                <li>Análise de dados de desempenho da plataforma;</li>
                <li>Comunicação com o usuário, se autorizado.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartilhamento de Dados</h2>
              <p className="text-gray-700 mb-6">
                Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Seus dados são tratados conforme os princípios da Lei Geral de Proteção de Dados (LGPD).
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Armazenamento e Segurança</h2>
              <p className="text-gray-700 mb-6">
                Os dados são armazenados com uso de criptografia e boas práticas de segurança. Apenas pessoas autorizadas têm acesso restrito às informações.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Direitos do Titular</h2>
              <p className="text-gray-700 mb-4">Você pode a qualquer momento solicitar:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Acesso aos seus dados;</li>
                <li>Correção de informações;</li>
                <li>Exclusão de dados;</li>
                <li>Revogação de consentimento.</li>
              </ul>
              <p className="text-gray-700">
                Para isso, entre em contato através do e-mail: <a href="mailto:contato@osfornecedores.com" className="text-[#9b87f5] hover:underline">contato@osfornecedores.com</a>
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

export default PrivacyPolicy;
