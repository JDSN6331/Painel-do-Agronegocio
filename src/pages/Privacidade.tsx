import Header from "@/components/Header";
import bgPattern from "@/assets/agro-wheat-bg.jpg";

const Privacidade = () => {
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
        <main className="container mx-auto px-4 lg:pt-40 pt-56 pb-12 flex-grow flex items-center justify-center">
          <div className="glass-panel p-8 md:p-12 max-w-4xl w-full rounded-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl md:text-4xl font-bold text-gold-gradient mb-8 font-heading text-center">Política de Privacidade</h1>
            
            <div className="space-y-8 text-muted-foreground leading-relaxed text-[1.05rem]">
              <p>Esta Política de Privacidade descreve como as informações são coletadas, utilizadas e protegidas pelo <strong>Painel do Agronegócio</strong>.</p>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3 font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  Coleta de informações
                </h2>
                <p>Podemos coletar informações de navegação, como endereço IP, tipo de navegador e páginas acessadas, com o objetivo de melhorar a experiência do usuário.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3 font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  Uso de cookies
                </h2>
                <p>Utilizamos cookies para personalizar conteúdo e analisar o tráfego. O uso de cookies pode ser controlado pelo usuário no navegador.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3 font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  Publicidade
                </h2>
                <p>Este site pode exibir anúncios por meio de parceiros como o Google AdSense, que utilizam cookies para oferecer anúncios relevantes de acordo com as preferências do usuário.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3 font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  Segurança
                </h2>
                <p>Adotamos as melhores práticas e medidas de segurança para proteger as informações e dados em nosso site, buscando sempre a integridade da navegação, mas não podemos garantir segurança absoluta contra todos os tipos de ameaças na internet.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground mb-3 font-heading flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-agro-gold rounded-full inline-block"></span>
                  Contato
                </h2>
                <p>Em caso de dúvidas sobre nossa Política de Privacidade, entre em contato pelo e-mail informado na página de contato.</p>
              </section>
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

export default Privacidade;
