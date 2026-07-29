import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { Info, Award, Users, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Sobre = () => {
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

        <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-16 flex-grow flex items-center justify-center">
          <div className="glass-panel p-8 md:p-12 max-w-4xl w-full rounded-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Info className="w-8 h-8 text-agro-gold" />
              <h1 className="text-2xl md:text-4xl font-bold text-gold-gradient font-heading text-center">
                Sobre o Painel do Agronegócio
              </h1>
            </div>

            <p className="text-sm text-center text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Sua plataforma centralizada de inteligência agropecuária, ferramentas operacionais e conhecimento técnico autoral para o produtor rural brasileiro.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-background/40 p-5 rounded-xl border border-agro-gold/20 text-center space-y-2">
                <Target className="w-6 h-6 text-agro-gold mx-auto" />
                <h3 className="text-sm font-bold text-foreground">Missão</h3>
                <p className="text-xs text-muted-foreground">
                  Democratizar o acesso a cotações transparentes, dados meteorológicos e artigos de alta relevância técnica.
                </p>
              </div>

              <div className="bg-background/40 p-5 rounded-xl border border-agro-gold/20 text-center space-y-2">
                <Award className="w-6 h-6 text-agro-gold mx-auto" />
                <h3 className="text-sm font-bold text-foreground">Conteúdo & Curadoria</h3>
                <p className="text-xs text-muted-foreground">
                  Artigos práticos, guias orientativos e compilação das principais tendências para o dia a dia do produtor.
                </p>
              </div>

              <div className="bg-background/40 p-5 rounded-xl border border-agro-gold/20 text-center space-y-2">
                <Users className="w-6 h-6 text-agro-gold mx-auto" />
                <h3 className="text-sm font-bold text-foreground">Apoio ao Produtor</h3>
                <p className="text-xs text-muted-foreground">
                  Calculadoras agrícolas gratuitas que auxiliam no planejamento de custos e tomada de decisões no campo.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-muted-foreground leading-relaxed text-sm md:text-base border-t border-border/40 pt-8">
              <h2 className="text-lg md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-agro-gold" />
                Quem Somos e Nossos Compromissos
              </h2>

              <p>
                O <strong>Painel do Agronegócio</strong> nasceu da necessidade de conectar o produtor rural, estudantes de agronomia e investidores do setor a informações precisas, rápidas e fundamentadas.
              </p>

              <p>
                Nossa plataforma combina dados em tempo real obtidos de fontes públicas e cooperativas respeitadas com uma biblioteca de <strong>artigos orientativos e guias práticos</strong> abrangendo grãos, cafeicultura, pecuária de corte e leite, defensivos agrícolas, nutrição de plantas e inovação tecnológica.
              </p>

              <div className="bg-agro-gold/10 p-5 rounded-xl border border-agro-gold/30 my-6">
                <h3 className="text-sm font-bold text-agro-gold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Diretrizes de Transparência
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Buscamos a máxima imparcialidade na curadoria de dados e na compilação dos nossos artigos. Não comercializamos insumos nem possuímos vínculo exclusivo com marcas de defensivos ou maquinário, garantindo isenção total nas informações disponibilizadas.
                </p>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground mb-4">
                  Fundador e Desenvolvedor: <strong>José Duque da Silva Neto</strong>
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link to="/artigos" className="btn-gold text-xs px-4 py-2">
                    Explorar Todos os Artigos
                  </Link>
                  <Link to="/contato" className="text-xs text-agro-gold hover:underline font-semibold">
                    Fale Conosco
                  </Link>
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

export default Sobre;
