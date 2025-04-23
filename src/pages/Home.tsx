
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

export default function Home() {
  // Featured content carousel
  const featuredItems = [
    {
      id: 1,
      title: "Relatório de investimentos 2025",
      image: "https://images.unsplash.com/photo-1460574283810-2aab119d8511",
      category: "Financeiro"
    },
    {
      id: 2,
      title: "Novos mercados emergentes",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      category: "Global"
    },
    {
      id: 3,
      title: "Tendências de inovação",
      image: "https://images.unsplash.com/photo-1473177104440-ffee2f376098",
      category: "Tecnologia"
    }
  ];

  // Latest updates
  const latestUpdates = [
    {
      id: 1,
      title: "Novos parceiros comerciais",
      description: "Conheça os novos fornecedores de tecnologia.",
      time: "2h atrás",
      badge: "Novo"
    },
    {
      id: 2,
      title: "Relatório financeiro do Q2",
      description: "Os resultados do segundo trimestre já estão disponíveis.",
      time: "5h atrás"
    },
    {
      id: 3,
      title: "Atualizações de produtos",
      description: "Confira as últimas atualizações dos nossos produtos.",
      time: "1d atrás"
    }
  ];

  // Events
  const events = [
    {
      id: 1,
      title: "Reunião de diretoria",
      date: "Hoje, 15:00",
      location: "Sala de conferência"
    },
    {
      id: 2,
      title: "Workshop de inovação",
      date: "Amanhã, 10:00",
      location: "Auditório principal"
    },
    {
      id: 3,
      title: "Apresentação de resultados",
      date: "26/04, 14:00",
      location: "Online"
    }
  ];

  // News feed
  const news = [
    {
      id: 1,
      title: "Expansão de mercado",
      description: "Brasil amplia presença no mercado internacional com novos acordos comerciais.",
      source: "Economia Brasil"
    },
    {
      id: 2,
      title: "Inovação tecnológica",
      description: "Startups brasileiras atraem investimentos recordes em 2025.",
      source: "Tech News"
    },
    {
      id: 3,
      title: "Sustentabilidade",
      description: "Empresas adotam práticas ESG e aumentam competitividade global.",
      source: "Sustainably Today"
    }
  ];

  return (
    <AppLayout>
      {/* Featured Content Carousel */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gradient">Destaques</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {featuredItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="glass-morphism rounded-xl overflow-hidden card-hover h-[200px]">
                  <div className="relative w-full h-full">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                      <Badge variant="outline" className="w-fit mb-2 bg-black/30 text-white border-white/10">
                        {item.category}
                      </Badge>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white" />
          <CarouselNext className="right-1 bg-black/30 border-white/10 text-white hover:bg-black/50 hover:text-white" />
        </Carousel>
      </section>

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: Latest Updates */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gradient-primary">Últimas Atualizações</h2>
          <div className="space-y-4">
            {latestUpdates.map((update) => (
              <Card key={update.id} className="glass-morphism border-white/10 card-hover">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{update.title}</h3>
                    {update.badge && (
                      <Badge className="bg-brand.purple text-white">
                        {update.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{update.description}</p>
                  <p className="text-xs text-gray-400">{update.time}</p>
                </CardContent>
              </Card>
            ))}
            <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
              Ver todos
            </Button>
          </div>
        </section>

        {/* Column 2: Upcoming Events */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gradient-primary">Próximos Eventos</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="glass-morphism border-white/10 card-hover">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-300 mb-1">
                    <div className="w-3 h-3 rounded-full bg-brand.blue mr-2"></div>
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-brand.purple/50 mr-2"></div>
                    {event.location}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
              Ver todos
            </Button>
          </div>
        </section>

        {/* Column 3: News Feed */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-gradient-primary">Suno Minuto</h2>
          <div className="space-y-4">
            {news.map((item) => (
              <Card key={item.id} className="glass-morphism border-white/10 card-hover">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                  <p className="text-xs text-gray-400">Fonte: {item.source}</p>
                </CardContent>
              </Card>
            ))}
            <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
              Ver mais notícias
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
