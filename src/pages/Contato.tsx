import Header from "@/components/Header";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { Mail } from "lucide-react";

const Contato = () => {
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
        <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-12 flex-grow flex items-center justify-center">
          <div className="glass-panel p-8 md:p-12 max-w-2xl w-full rounded-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500 text-center">
            <h1 className="text-xl md:text-3xl font-bold text-gold-gradient mb-6 md:mb-8 font-heading">Contato</h1>
            
            <div className="space-y-6 md:space-y-8 text-muted-foreground leading-relaxed text-sm md:text-lg">
              <p>Se você tiver dúvidas, sugestões ou quiser entrar em contato com a nossa equipe, ficaremos felizes em ouvir você.</p>

              <div className="flex flex-col items-center justify-center gap-4 bg-background/40 p-6 rounded-xl border border-border/50">
                <Mail className="w-10 h-10 text-agro-gold mb-2" />
                <p>Envie um e-mail para:</p>
                <a 
                  href="mailto:jdsn.duque@gmail.com" 
                  className="text-base md:text-2xl font-bold text-foreground hover:text-agro-gold transition-colors"
                >
                  jdsn.duque@gmail.com
                </a>
              </div>

              <p>Respondemos o mais breve possível.</p>
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

export default Contato;
