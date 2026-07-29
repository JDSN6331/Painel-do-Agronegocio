import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { Shield, Lock, Eye, Cookie, FileText } from "lucide-react";

const Privacidade = () => {
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
              <Shield className="w-8 h-8 text-agro-gold" />
              <h1 className="text-2xl md:text-4xl font-bold text-gold-gradient font-heading text-center">
                Política de Privacidade
              </h1>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-8">
              Conformidade com a Lei Geral de Proteção de Dados (LGPD) e Políticas do Google AdSense
            </p>

            <div className="space-y-6 md:space-y-8 text-muted-foreground leading-relaxed text-sm md:text-base">
              <p>
                A sua privacidade é fundamental para o <strong>Painel do Agronegócio</strong>. Esta Política de Privacidade explica detalhadamente como suas informações pessoais e dados de navegação são coletados, utilizados, protegidos e mantidos em conformidade com a legislação brasileira (LGPD - Lei nº 13.709/2018).
              </p>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <Eye className="w-5 h-5 text-agro-gold" />
                  1. Coleta de Informações
                </h2>
                <p>
                  Coletamos informações não identificáveis de navegação automaticamente quando você visita o site, tais como: endereço IP, tipo de navegador, sistema operacional, páginas visitadas e tempo de permanência. Esses dados são utilizados exclusivamente de forma agregada para análise estatística e melhoria do desempenho técnico do portal.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-agro-gold" />
                  2. Cookies e Web Beacons
                </h2>
                <p>
                  Utilizamos cookies para armazenar preferências de navegação e oferecer uma experiência personalizada ao usuário. Um cookie é um pequeno arquivo de texto enviado ao seu navegador por um site que você visita.
                </p>
              </section>

              <section className="space-y-3 bg-agro-gold/5 p-4 md:p-6 rounded-xl border border-agro-gold/20">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-agro-gold" />
                  3. Anúncios do Google AdSense e Cookies DART
                </h2>
                <p>
                  O <strong>Painel do Agronegócio</strong> pode exibir anúncios veiculados pelo <strong>Google AdSense</strong>.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
                  <li>
                    O Google, como fornecedor de terceiros, utiliza cookies para veicular anúncios neste site.
                  </li>
                  <li>
                    Com o cookie DART, o Google pode veicular anúncios para os usuários com base nas suas visitas a este e a outros sites na Internet.
                  </li>
                  <li>
                    Os usuários podem desativar o uso do cookie DART visitando a{" "}
                    <a
                      href="https://policies.google.com/technologies/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-agro-gold hover:underline font-semibold"
                    >
                      Política de Privacidade da rede de conteúdo e dos anúncios do Google
                    </a>.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <Lock className="w-5 h-5 text-agro-gold" />
                  4. Segurança das Informações e LGPD
                </h2>
                <p>
                  Adotamos medidas técnicas e organizacionais de segurança para proteger os dados contra acesso não autorizado, alteração ou destruição. Em consonância com a LGPD, o usuário possui o direito de solicitar esclarecimentos sobre o tratamento dos seus dados a qualquer momento através dos nossos canais de contato.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base md:text-xl font-bold text-foreground font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  5. Contato sobre Privacidade
                </h2>
                <p>
                  Em caso de dúvidas sobre nossa Política de Privacidade ou para exercer seus direitos previstos pela LGPD, entre em contato pela nossa página oficial de contato.
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

export default Privacidade;
