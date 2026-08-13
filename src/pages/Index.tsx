import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuotesPanel from "@/components/QuotesPanel";
import WeatherPanel from "@/components/WeatherPanel";
import NewsPanel from "@/components/NewsPanel";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles, Clock, ExternalLink } from "lucide-react";
import { ARTICLES_DATA } from "@/data/articlesData";

const Index = () => {
  // Show top 3 recent articles on homepage
  const recentArticles = ARTICLES_DATA.slice(0, 3);

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
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main Content with padding for fixed header */}
        <main className="container mx-auto px-3 sm:px-4 pt-72 sm:pt-[200px] md:pt-48 lg:pt-40 pb-8 sm:pb-12 flex-grow">
          {/* Info Panels (Quotes and Weather) */}
          <div className="flex flex-col gap-4 mb-8">
            <QuotesPanel />
            <WeatherPanel />
          </div>

          {/* Featured Editorial Articles Section (Original Content for AdSense & SEO) */}
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-agro-gold font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Conteúdo Autoral & Exclusivo
                </div>
                <h2 className="text-xl md:text-2xl font-bold font-heading text-gold-gradient">
                  Artigos & Análises do Agronegócio
                </h2>
              </div>
              <Link
                to="/artigos"
                className="btn-gold text-xs px-4 py-2 inline-flex items-center gap-2"
              >
                <span>Ver todos os artigos ({ARTICLES_DATA.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="glass-card rounded-xl overflow-hidden flex flex-col h-full hover:border-agro-gold/50 transition-all duration-300 group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/80 backdrop-blur-md text-agro-gold border border-agro-gold/30 text-[11px] font-medium rounded-md">
                      {article.categoryName}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                      <Clock className="w-3 h-3 text-agro-gold" />
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-agro-gold transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {article.excerpt}
                    </p>

                    <Link
                      to={`/artigos/${article.slug}`}
                      className="text-xs font-semibold text-agro-gold inline-flex items-center gap-1.5 mt-auto hover:underline"
                    >
                      Ler artigo completo
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Guia Agronômico Highlight Banner */}
          <section className="mb-12">
            <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-agro-gold/30 bg-gradient-to-r from-background/90 via-agro-gold/5 to-background/90 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agro-gold/10 border border-agro-gold/30 text-agro-gold text-xs font-semibold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    Solução Agronômica Recomendada
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-gold-gradient">
                    Guia Agronômico AgroBase
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Acesse um guia completo de insumos, manejo e recomendações técnicas para apoiar o planejamento e as melhores decisões no campo.
                  </p>
                </div>
                <a
                  href="https://crc-comercial-insumos-guia-agronomico.br1rfu.easypanel.host/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold px-5 py-3 text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-2 shrink-0 shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <span>Acessar Guia Agronômico AgroBase</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>

          {/* External News Panel */}
          <NewsPanel />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
