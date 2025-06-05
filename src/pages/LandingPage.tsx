import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Facebook, Instagram, Linkedin, Check } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useImageEditor } from '@/hooks/use-image-editor';
import { ImageEditor } from '@/components/landing/ImageEditor';
import { useAuth } from '@/hooks/useAuth';

const LandingPage = () => {
  const navigate = useNavigate();
  const { getImages } = useImageEditor();
  const { user } = useAuth();
  const mockImages = getImages();
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Force light mode for landing page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    return () => {
      // Don't reset theme when leaving landing page
      // Let the app's normal theme logic handle it
    };
  }, []);

  // If there's no landing page images saved, this will use the defaults
  useEffect(() => {
    // This is just to ensure the component re-renders if images change
    // Nothing needs to be done here
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Add the ImageEditor component - only for admins */}
      <ImageEditor isAdmin={true} />
      
      {/* Header - Sticky */}
      <header className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-sm border-b px-4 md:px-6 shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <span className="ml-2 font-bold text-xl hidden sm:inline text-gray-900">Conexão Brasil</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-gray-900">
              Benefícios
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-600 hover:text-gray-900">
              Depoimentos
            </button>
            <button onClick={() => scrollToSection('plans')} className="text-gray-600 hover:text-gray-900">
              Planos
            </button>
            <button onClick={() => scrollToSection('videos')} className="text-gray-600 hover:text-gray-900">
              Vídeos
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900">
              FAQ
            </button>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/auth/login')} className="border-gray-300 text-gray-900 hover:bg-gray-50">
              Login
            </Button>
            <Button onClick={() => navigate('/auth/register')} className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90 text-white">
              Cadastre-se
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content with padding for sticky header */}
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex flex-col space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">Encontre os Melhores Fornecedores de Moda do Brasil em um Só Lugar</h1>
                <p className="text-lg text-gray-600">
                  Acesse uma rede exclusiva de fornecedores verificados para impulsionar seu negócio de moda.
                </p>
                <div>
                  <Button 
                    onClick={() => navigate('/auth/register')} 
                    size="lg"
                    className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90 text-white"
                  >
                    Cadastre-se Agora
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/mosaico.png"
                  alt="Aplicativo Conexão Brasil" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section id="benefits" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Por que Escolher o Fabricante & Fornecedores?</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Solução completa para conectar você aos melhores fornecedores do mercado da moda
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Fornecedores Verificados",
                  description: "Acesso a uma ampla rede de fornecedores verificados e aprovados."
                },
                {
                  title: "Filtros Avançados",
                  description: "Filtros avançados para encontrar exatamente o que você precisa."
                },
                {
                  title: "Atualizações em Tempo Real",
                  description: "Atualizações em tempo real sobre novos fornecedores e produtos."
                },
                {
                  title: "Suporte Dedicado",
                  description: "Suporte dedicado para auxiliar em suas negociações."
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">O que Nossas Usuárias Dizem</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Veja como nossa plataforma tem ajudado empreendedoras de moda por todo o Brasil
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  quote: "Graças ao aplicativo, encontrei fornecedores incríveis que alavancaram minhas vendas!",
                  name: "Ana P.",
                  location: "São Paulo",
                  image: mockImages.testimonial1
                },
                {
                  quote: "A plataforma é intuitiva e me economiza horas de pesquisa.",
                  name: "Carla M.",
                  location: "Rio de Janeiro",
                  image: mockImages.testimonial2
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* App Demo Section */}
        <section id="demo" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Veja o Aplicativo em Ação</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Explore as funcionalidades que tornam o Fabricante & Fornecedores a escolha ideal para empreendedoras de moda.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { 
                  image: "/lovable-uploads/2cb1adf7-d40e-450c-a26f-acc971e14caa.png", 
                  title: "Página Inicial - Fornecedores Recentes e Populares",
                  description: "Veja fornecedores recentes e populares logo na tela inicial com acesso rápido aos detalhes."
                },
                { 
                  image: "/lovable-uploads/ac0b59f5-0390-4cfc-80d1-29329573eb13.png", 
                  title: "Pesquisa Avançada com Filtros",
                  description: "Use filtros detalhados para encontrar fornecedores por categoria, localização, forma de pagamento e muito mais."
                },
                { 
                  image: "/lovable-uploads/b186270b-9401-42ed-8f7c-d24f90e5a26d.png", 
                  title: "Perfil Detalhado do Fornecedor",
                  description: "Acesse informações completas, contatos diretos e condições comerciais de cada fornecedor."
                }
              ].map((screen, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                  <img 
                    src={screen.image} 
                    alt={screen.title} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6 bg-white">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{screen.title}</h3>
                    <p className="text-gray-600 text-sm">{screen.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Videos Section */}
        <section id="videos" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">O que você vai encontrar na plataforma?</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Descubra os diversos segmentos de moda disponíveis em nossa plataforma
              </p>
            </div>
            
            <div className="flex overflow-x-auto space-x-6 pb-8 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:space-x-0 md:max-w-7xl md:mx-auto custom-scrollbar">
              {[
                { title: "Moda Plus Size", youtubeId: "W3lF47bX3to", desc: "Descubra fornecedores incríveis de moda plus size com peças modernas e confortáveis." },
                { title: "Moda Fitness", youtubeId: "YDG0MoazL-I", desc: "As melhores marcas e tendências em moda fitness para seus clientes se exercitarem com estilo." },
                { title: "Moda Evangélica", youtubeId: "lrrO6sGcwJg", desc: "Elegância e sofisticação em moda evangélica, com opções para todas as ocasiões." },
                { title: "Todos Estilos de Moda", youtubeId: "srYjExvc8S8", desc: "Peças ousadas e cheias de brilho para quem quer arrasar na noite. Encontre aqui!" }, 
               ].map((videoItem, index) => (
                <div key={index} className="flex-shrink-0 w-3/4 sm:w-2/3 md:w-full snap-center bg-white/90 backdrop-blur-md p-6 rounded-xl border border-gray-200 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-[#9b87f5]/70 hover:scale-[1.02]">
                  <h3 className="text-xl font-semibold mb-3 text-[#9b87f5]">{videoItem.title}</h3>
                  <div className="aspect-[9/16] w-full rounded-md overflow-hidden mb-3">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoItem.youtubeId}`}
                      title={videoItem.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{videoItem.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/auth/register')}
                className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90 text-white font-bold py-3 px-8 sm:py-4 sm:px-10 rounded-lg text-lg sm:text-xl transform transition-transform duration-200 hover:scale-105 shadow-lg"
              >
                Quero ter acesso
              </Button>
            </div>
          </div>
        </section>
        
        {/* Pricing Plans */}
        <section id="plans" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Escolha o Plano Perfeito para Você</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Nossos planos são projetados para atender diferentes necessidades e estágios de negócio
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Plano Grátis</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 0</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Acesso limitado a fornecedores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Visualize 3 fornecedores por dia</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">3 dias para testar</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Ideal para experimentar</p>
                  <Button onClick={() => navigate('/auth/register?plan=free')} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Começar Grátis
                  </Button>
                </div>
              </div>
              
              {/* Monthly Plan */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Plano Mensal</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 9,70</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Acesso a fornecedores verificados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Suporte padrão</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Filtros básicos</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Ideal para quem quer começar</p>
                  <Button onClick={() => navigate('/auth/register?plan=monthly')} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                    Assinar Plano Mensal
                  </Button>
                </div>
              </div>
              
              {/* Annual Plan */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#9b87f5] relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#9b87f5] text-white px-3 py-1 rounded-full text-sm">
                  Melhor Oferta!
                </div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Plano Anual</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-gray-900">R$ 87,00</span>
                  <span className="text-gray-600 block text-sm">Pagamento único anual</span>
                  <p className="text-sm text-green-600 font-medium">De <span className="line-through">R$ 116,40</span> por R$ 87,00 à vista</p>
                  <p className="text-xs text-gray-600">(Economize R$ 29,40 - Oferta Limitada)</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Acesso ilimitado a fornecedores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Suporte prioritário</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Filtros avançados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Conteúdo exclusivo</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Ideal para quem busca o melhor custo-benefício</p>
                  <Button 
                    onClick={() => navigate('/auth/register?plan=yearly')}
                    className="w-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90 text-white"
                  >
                    Assinar Plano Anual
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Dúvidas Frequentes</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Encontre respostas para as perguntas mais comuns sobre nossa plataforma
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">1. Os fornecedores são realmente confiáveis?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Sim! Todos os fornecedores disponíveis na plataforma são previamente verificados por nossa equipe. Trabalhamos apenas com parceiros que possuem histórico sólido no mercado de moda, garantindo segurança e qualidade para o seu negócio.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">2. De onde são os fornecedores da plataforma?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Atualmente, contamos com fornecedores das principais regiões do Brasil, incluindo São Paulo, Goiânia, Fortaleza e Pernambuco. Essa diversidade regional permite uma ampla variedade de estilos e produtos para atender às suas necessidades.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">3. Após o pagamento, em quanto tempo terei acesso à plataforma?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    A liberação do acesso é imediata após a confirmação do pagamento. Você receberá um e-mail com as instruções para começar a explorar todos os recursos disponíveis.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">4. Vou receber um PDF com as informações?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Não! Nossa plataforma é dinâmica e interativa, com atualizações frequentes e uma comunidade ativa de vendedoras que compartilham avaliações e comentários sobre os fornecedores. Isso proporciona uma experiência muito mais rica e atualizada do que um PDF estático.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">5. Por quanto tempo terei acesso à plataforma?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Oferecemos dois tipos de planos:{'\n'}Plano Anual: Acesso por 12 meses, com renovação anual.{'\n'}Plano Mensal: Acesso contínuo enquanto a assinatura estiver ativa.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">6. Preciso ter CNPJ para comprar dos fornecedores?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Não! A maioria dos fornecedores aceita compras com CPF. Alguns podem solicitar CNPJ, mas essa não é uma exigência geral na plataforma.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">7. Quais tipos de fornecedores encontrarei na plataforma?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Você terá acesso a uma variedade de fornecedores especializados em diversos segmentos, como:{'\n'}Moda Plus Size{'\n'}Moda Fitness{'\n'}Moda Balada{'\n'}Moda Evangélica{'\n'}E muitos outros.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-8" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">8. A plataforma oferece suporte ao usuário?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Sim! Disponibilizamos suporte dedicado para auxiliá-lo em suas negociações e no uso da plataforma, garantindo que você aproveite ao máximo todos os recursos disponíveis.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-9" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">9. Os conteúdos da área de dicas são atualizados regularmente?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Sim! Nossa equipe atualiza constantemente a área de conteúdos, trazendo as informações mais recentes e relevantes sobre tráfego pago, empreendedorismo, finanças e gestão para impulsionar o seu negócio de moda.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-10" className="border-gray-200">
                  <AccordionTrigger className="text-gray-900 hover:text-gray-700">10. Como posso cancelar minha assinatura?</AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta, de forma simples e sem burocracia.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CB</span>
                </div>
                <span className="ml-2 font-bold text-xl text-gray-900">Conexão Brasil</span>
              </div>
              <p className="text-gray-600 text-sm">
                Conectando empreendedores aos melhores fornecedores de moda do Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('benefits')} className="text-gray-600 hover:text-gray-900">Benefícios</button></li>
                <li><button onClick={() => scrollToSection('plans')} className="text-gray-600 hover:text-gray-900">Planos</button></li>
                <li><button onClick={() => scrollToSection('videos')} className="text-gray-600 hover:text-gray-900">Vídeos</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="text-gray-600 hover:text-gray-900">FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/legal/terms')} className="text-gray-600 hover:text-gray-900">Termos de Uso</button></li>
                <li><button onClick={() => navigate('/legal/privacy')} className="text-gray-600 hover:text-gray-900">Política de Privacidade</button></li>
                <li><button onClick={() => navigate('/legal/cookies')} className="text-gray-600 hover:text-gray-900">Política de Cookies</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900">Redes Sociais</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center text-[#9b87f5] hover:bg-[#9b87f5]/20 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center text-[#9b87f5] hover:bg-[#9b87f5]/20 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center text-[#9b87f5] hover:bg-[#9b87f5]/20 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Os Fornecedores. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
