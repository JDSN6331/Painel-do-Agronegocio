import Header from "@/components/Header";
import QuotesPanel from "@/components/QuotesPanel";
import WeatherPanel from "@/components/WeatherPanel";
import NewsPanel from "@/components/NewsPanel";
import bgPattern from "@/assets/agro-wheat-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        {/* Main Content with padding for fixed header */}
        <main className="container mx-auto px-3 sm:px-4 pt-44 sm:pt-40 md:pt-40 pb-8 sm:pb-12 flex-grow">
          {/* Info Panels */}
          <div className="flex flex-col gap-4 mb-8">
            <QuotesPanel />
            <WeatherPanel />
          </div>

          {/* News Categories */}
          <NewsPanel />
        </main>

        {/* Footer */}
        <footer className="glass-panel rounded-none border-x-0 border-b-0 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground mb-4">
              Notícias coletadas automaticamente via Google News RSS
            </p>
            <p className="text-muted-foreground text-sm">
              © 2026 Painel do Agronegócio
            </p>
            <hr className="border-muted-foreground/30 w-72 mx-auto my-3" />
            <p className="text-xs text-muted-foreground">
              Desenvolvido por José Duque da Silva Neto
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
