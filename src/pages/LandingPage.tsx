
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

  // If there's no landing page images saved, this will use the defaults
  useEffect(() => {
    // This is just to ensure the component re-renders if images change
    // Nothing needs to be done here
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <span className="ml-2 font-bold text-xl hidden sm:inline">Conexão Brasil</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('benefits')} className="text-muted-foreground hover:text-foreground">
              Benefícios
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-foreground">
              Depoimentos
            </button>
            <button onClick={() => scrollToSection('plans')} className="text-muted-foreground hover:text-foreground">
              Planos
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground">
              FAQ
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-muted-foreground hover:text-foreground">
              Contato
            </button>
          </nav>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/auth/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth/register')} className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90">
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
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Encontre os Melhores Fornecedores de Moda do Brasil em um Só Lugar</h1>
                <p className="text-lg text-muted-foreground">
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
              <h2 className="text-2xl md:text-3xl font-bold">Por que Escolher o Fabricante & Fornecedores?</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
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
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-full flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">O que Nossas Usuárias Dizem</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
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
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* App Demo Section */}
        <section id="demo" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">Veja o Aplicativo em Ação</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Explore as funcionalidades que tornam o Fabricante & Fornecedores a escolha ideal para empreendedoras de moda.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { image: "images/home.jpeg", title: "Busca de Fornecedores" },
                { image: "images/filtros.png", title: "Filtros Avançados" },
                { image: "images/perfil.jpeg", title: "Perfil Detalhado" }
              ].map((screen, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <img 
                    src={screen.image} 
                    alt={screen.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-center">{screen.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Plans */}
        <section id="plans" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">Escolha o Plano Perfeito para Você</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Nossos planos são projetados para atender diferentes necessidades e estágios de negócio
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-bold text-center mb-4">Plano Básico</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">R$ 29</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Acesso limitado a fornecedores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte padrão</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Filtros básicos</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Ideal para iniciantes no mercado</p>
                  <Button onClick={() => navigate('/auth/register')} className="w-full">
                    Assinar Plano Básico
                  </Button>
                </div>
              </div>
              
              {/* Premium Plan */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#9b87f5] relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#9b87f5] text-white px-3 py-1 rounded-full text-sm">
                  Recomendado
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Plano Premium</h3>
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold">R$ 79</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Acesso ilimitado a fornecedores</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Filtros avançados</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ferramentas avançadas de análise</span>
                  </li>
                </ul>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Ideal para negócios em expansão</p>
                  <Button 
                    onClick={() => navigate('/auth/register')}
                    className="w-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90"
                  >
                    Assinar Plano Premium
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">Dúvidas Frequentes</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Encontre respostas para as perguntas mais comuns sobre nossa plataforma
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como posso me cadastrar?</AccordionTrigger>
                  <AccordionContent>
                    Clique em "Cadastre-se" no topo da página e preencha o formulário com suas informações.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Posso mudar de plano depois?</AccordionTrigger>
                  <AccordionContent>
                    Sim, você pode alterar seu plano a qualquer momento nas configurações da sua conta.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>Os fornecedores são realmente verificados?</AccordionTrigger>
                  <AccordionContent>
                    Sim, todos os fornecedores passam por um processo de verificação antes de serem listados.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>Como posso entrar em contato com o suporte?</AccordionTrigger>
                  <AccordionContent>
                    Você pode entrar em contato através do e-mail suporte@conexaobrasil.com ou pelo chat disponível na plataforma.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>O que acontece após o cadastro?</AccordionTrigger>
                  <AccordionContent>
                    Após o cadastro, você terá acesso imediato à plataforma conforme o plano escolhido. Nossa equipe também entrará em contato para ajudar nos primeiros passos.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-[#9b87f5]/10 to-[#D946EF]/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Entre em Contato</h2>
                <p className="text-muted-foreground mb-6">
                  Estamos aqui para ajudar! Envie-nos suas dúvidas ou entre em contato por um dos nossos canais.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9b87f5]">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Telefone</p>
                      <p className="text-muted-foreground">(11) 3456-7890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9b87f5]">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-muted-foreground">contato@conexaobrasil.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9b87f5]">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Endereço</p>
                      <p className="text-muted-foreground">Av. Paulista, 1000 - São Paulo, SP</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Envie uma mensagem</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Nome</label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" placeholder="Seu email" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Assunto</label>
                    <Input id="subject" placeholder="Assunto da mensagem" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Mensagem</label>
                    <textarea
                      id="message"
                      placeholder="Sua mensagem"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    ></textarea>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-[#9b87f5] to-[#D946EF] hover:opacity-90">
                    Enviar Mensagem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-10 md:py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] rounded-xl p-8 md:p-10 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Fique por Dentro das Novidades</h2>
                <p className="mb-6">
                  Receba as últimas novidades e dicas diretamente no seu e-mail.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input 
                    placeholder="Seu melhor e-mail" 
                    type="email"
                    className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
                  />
                  <Button className="bg-white text-[#9b87f5] hover:bg-white/90">
                    Inscrever-se
                  </Button>
                </div>
              </div>
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
                <span className="ml-2 font-bold text-xl">Conexão Brasil</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Conectando empreendedores aos melhores fornecedores de moda do Brasil.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('benefits')} className="text-muted-foreground hover:text-foreground">Benefícios</button></li>
                <li><button onClick={() => scrollToSection('plans')} className="text-muted-foreground hover:text-foreground">Planos</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground">FAQ</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-muted-foreground hover:text-foreground">Contato</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Termos de Uso</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Política de Privacidade</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Política de Cookies</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Redes Sociais</h3>
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
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Conexão Brasil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
