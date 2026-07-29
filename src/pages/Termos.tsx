import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { FileText, ShieldCheck, AlertCircle, HelpCircle } from "lucide-react";

const Termos = () => {
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
              <FileText className="w-8 h-8 text-agro-gold" />
              <h1 className="text-2xl md:text-4xl font-bold text-gold-gradient font-heading">
                Termos e Condições de Uso
              </h1>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-8">
              Última atualização: 28 de julho de 2026
            </p>

            <div className="space-y-6 md:space-y-8 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p>
                Bem-vindo ao <strong>Painel do Agronegócio</strong>. Ao acessar e utilizar este website (disponível em <span className="text-agro-gold font-medium">painelagrofocus.com</span>), você concorda expressamente em cumprir e estar vinculado aos seguintes Termos e Condições de Uso. Caso não concorde com qualquer disposição aqui apresentada, solicitamos que não utilize a plataforma.
              </p>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-agro-gold" />
                  1. Objeto e Finalidade da Plataforma
                </h2>
                <p>
                  O <strong>Painel do Agronegócio</strong> é uma plataforma informativa e utilitária que disponibiliza cotações do mercado agropecuário, previsão do tempo, ferramentas de cálculo agrícola e artigos técnicos originais.
                </p>
                <p>
                  Os conteúdos possuem caráter exclusivamente educativo, informativo e de apoio à gestão rural, não constituindo consultoria jurídica, financeira ou de investimentos.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-agro-gold" />
                  2. Isenção de Responsabilidade sobre Cotações e Dados
                </h2>
                <p>
                  Embora nos esforcemos para manter as informações de cotações, clima e índices de mercado sempre atualizadas e precisas, os dados são obtidos de fontes públicas e APIs de terceiros.
                </p>
                <p>
                  O Painel do Agronegócio não se responsabiliza por eventuais oscilações de mercado, inconsistências temporárias em APIs de terceiros ou decisões de negócios e compras de insumos tomadas com base nas informações e calculadoras disponibilizadas no site.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  3. Propriedade Intelectual e Direitos Autorais
                </h2>
                <p>
                  Todo o conteúdo autoral publicado no portal — incluindo artigos técnicos, código da aplicação, layout visual, logos e ferramentas simuladoras — é de propriedade exclusiva do <strong>Painel do Agronegócio</strong> e protegido pela legislação de direitos autorais brasileira.
                </p>
                <p>
                  É proibida a cópia, reprodução total ou parcial, ou republicação sem a citação da fonte e link direto para a publicação original neste portal.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  4. Anúncios de Terceiros e Google AdSense
                </h2>
                <p>
                  Este site pode exibir anúncios publicitários fornecidos por parceiros de mídia, como o <strong>Google AdSense</strong>. Ao navegar na plataforma, você reconhece que terceiros podem colocar e ler cookies no seu navegador para veiculação de anúncios personalizados com base nas suas visitas.
                </p>
                <p>
                  Para saber mais sobre o tratamento de dados e como desativar cookies de publicidade, consulte nossa página de Política de Privacidade.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-agro-gold" />
                  5. Contato e Alterações dos Termos
                </h2>
                <p>
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento, sem aviso prévio. As alterações entrarão em vigor imediatamente após a sua publicação no site.
                </p>
                <p>
                  Em caso de dúvidas sobre estes Termos, entre em contato através da nossa página oficial de contato.
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Termos;
