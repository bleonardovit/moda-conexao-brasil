
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">📄 Termos de Uso</h1>
            <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-6">
                Ao acessar e utilizar a plataforma OS Fornecedores, você concorda com os presentes Termos de Uso. Se você não concordar com qualquer parte dos termos, por favor, não utilize a plataforma.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 mb-6">
                OS Fornecedores é uma plataforma digital que tem como objetivo reunir e listar fornecedores confiáveis, especialmente voltados ao segmento de moda e comércio. Os dados exibidos são coletados, organizados e disponibilizados para fins de consulta.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Isenção de Responsabilidade</h2>
              <div className="text-gray-700 mb-6">
                <p className="mb-4">
                  A plataforma não realiza vendas, intermediações ou transações financeiras entre os usuários e os fornecedores listados. Não há vínculo comercial, jurídico ou contratual entre a plataforma e os fornecedores.
                </p>
                <p>
                  O usuário é o único responsável por verificar as informações do fornecedor antes de realizar qualquer transação.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conduta do Usuário</h2>
              <p className="text-gray-700 mb-4">Ao utilizar a plataforma, o usuário se compromete a:</p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Não utilizar a plataforma para fins ilícitos;</li>
                <li>Não tentar acessar áreas administrativas sem autorização;</li>
                <li>Não tentar fraudar o sistema de acesso gratuito limitado.</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Modificações</h2>
              <p className="text-gray-700">
                Estes termos podem ser atualizados a qualquer momento. Recomendamos que você os revise periodicamente.
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

export default TermsOfService;
