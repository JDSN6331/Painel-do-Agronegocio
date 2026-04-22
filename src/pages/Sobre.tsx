import Header from "@/components/Header";
import bgPattern from "@/assets/agro-wheat-bg.jpg";

const Sobre = () => {
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
        <main className="container mx-auto px-4 pt-[260px] sm:pt-56 lg:pt-40 pb-12 flex-grow flex items-center justify-center">
          <div className="glass-panel p-8 md:p-12 max-w-3xl w-full rounded-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl md:text-3xl font-bold text-gold-gradient mb-6 md:mb-8 font-heading text-center">Sobre o Painel do Agronegócio</h1>
            
            <div className="space-y-4 md:space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
              <p>O <strong>Painel do Agronegócio</strong> é uma plataforma desenvolvida para reunir informações relevantes do setor agrícola brasileiro em um único lugar.</p>

              <p>Nosso objetivo é fornecer dados atualizados sobre cotações, clima e notícias do agronegócio, auxiliando produtores, investidores e profissionais do setor na tomada de decisões.</p>

              <p>As informações são coletadas de fontes confiáveis e organizadas de forma clara e acessível.</p>

              <p>Este projeto foi criado com foco em simplicidade, eficiência e utilidade prática para o dia a dia do agro.</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="glass-panel rounded-none border-x-0 border-b-0 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Painel do Agronegócio
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

export default Sobre;
