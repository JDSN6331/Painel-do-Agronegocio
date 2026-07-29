import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { Mail, MessageSquare, MapPin } from "lucide-react";

const Contato = () => {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main Content with padding for fixed header */}
        <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-16 flex-grow flex items-center justify-center">
          <div className="glass-panel p-8 md:p-12 max-w-2xl w-full rounded-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500 text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gold-gradient mb-4 font-heading">
              Fale Conosco
            </h1>

            <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-8">
              Dúvidas, sugestões de reportagens, parcerias ou feedbacks sobre nossas calculadoras? Estamos prontos para atender você.
            </p>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-3 bg-background/40 p-6 rounded-xl border border-agro-gold/30 shadow-lg">
                <Mail className="w-10 h-10 text-agro-gold" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  E-mail Oficial de Atendimento
                </p>
                <a
                  href="mailto:jdsn.duque@gmail.com"
                  className="text-lg md:text-2xl font-bold text-foreground hover:text-agro-gold transition-colors"
                >
                  jdsn.duque@gmail.com
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t border-border/40">
                <div className="flex items-center justify-center gap-2 bg-background/20 p-3 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-agro-gold" />
                  <span>Atendimento em até 24h úteis</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-background/20 p-3 rounded-lg">
                  <MapPin className="w-4 h-4 text-agro-gold" />
                  <span>Brasil • Atendimento Nacional</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Contato;
