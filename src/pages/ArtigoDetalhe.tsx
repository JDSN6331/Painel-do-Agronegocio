import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { ARTICLES_DATA } from "@/data/articlesData";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ChevronRight,
  Tag,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ArtigoDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="container mx-auto px-4 pt-48 pb-16 flex-grow flex items-center justify-center">
            <div className="glass-panel p-8 text-center max-w-md w-full rounded-2xl">
              <BookOpen className="w-12 h-12 text-agro-gold mx-auto mb-4" />
              <h1 className="text-xl font-bold font-heading text-foreground mb-2">
                Artigo Não Encontrado
              </h1>
              <p className="text-xs text-muted-foreground mb-6">
                O artigo procurado não foi localizado ou pode ter sido movido.
              </p>
              <button
                onClick={() => navigate("/artigos")}
                className="btn-gold text-xs px-4 py-2 inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para Artigos
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Related articles: prioritize same category, fallback to others if fewer than 3
  const sameCategory = ARTICLES_DATA.filter(
    (a) => a.id !== article.id && a.category === article.category
  );
  const otherCategory = ARTICLES_DATA.filter(
    (a) => a.id !== article.id && a.category !== article.category
  );
  const relatedArticles = [...sameCategory, ...otherCategory].slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;

    // 1. Try Native Web Share API (Mobile / supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // 2. Try Modern Clipboard API (Secure HTTPS / localhost)
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiado!",
          description: "O link deste artigo foi copiado para sua área de transferência.",
        });
        return;
      } catch (err) {
        // Fallback to legacy copy below
      }
    }

    // 3. Fallback for non-secure HTTP contexts (e.g. http://172.16.253.34:8085)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast({
          title: "Link copiado!",
          description: "O link deste artigo foi copiado para sua área de transferência.",
        });
      } else {
        throw new Error("execCommand copy failed");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link automaticamente.",
      });
    }
  };

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

        <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-16 flex-grow max-w-4xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 overflow-x-auto no-scrollbar">
            <Link to="/" className="hover:text-agro-gold transition-colors whitespace-nowrap">
              Início
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
            <Link to="/artigos" className="hover:text-agro-gold transition-colors whitespace-nowrap">
              Artigos
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
            <span className="text-agro-gold font-medium truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </nav>

          {/* Article Header */}
          <article className="glass-panel p-6 md:p-10 rounded-2xl mb-12">
            <div className="flex items-center gap-3 text-xs text-agro-gold-light mb-4">
              <span className="px-3 py-1 bg-agro-gold/10 border border-agro-gold/30 rounded-full font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                {article.categoryName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold font-heading text-foreground mb-4 leading-tight">
              {article.title}
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed border-l-4 border-agro-gold pl-4 py-1 italic bg-background/30 rounded-r-lg">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-border/40 mb-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-agro-gold" />
                  <span className="font-semibold text-foreground">{article.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-agro-gold" />
                  <span>
                    {article.publishedAt.split('-').reverse().join('/')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="btn-gold text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartilhar
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative h-64 sm:h-96 rounded-xl overflow-hidden mb-8 border border-border/40 shadow-lg">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/fallbacks/default-agro.jpg";
                }}
              />
            </div>

            {/* Article Content Paragraphs */}
            <div className="prose prose-invert max-w-none space-y-5 text-foreground/90 text-sm md:text-base leading-relaxed">
              {article.content.map((paragraph, idx) => {
                if (typeof paragraph !== "string") return null;
                if (paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ")) {
                  return (
                    <div key={idx} className="bg-background/40 p-4 rounded-xl border-l-4 border-agro-gold my-3 shadow-sm">
                      <p className="font-semibold text-agro-gold-light">{paragraph.replace(/\*\*/g, '')}</p>
                    </div>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <div key={idx} className="flex items-start gap-3.5 pl-2 py-1">
                      <span className="w-2 h-2 rounded-full bg-agro-gold mt-2 flex-shrink-0" />
                      <p className="text-foreground/90 font-medium">{paragraph.substring(2).replace(/\*\*/g, '')}</p>
                    </div>
                  );
                }
                return <p key={idx}>{paragraph.replace(/\*\*/g, '')}</p>;
              })}
            </div>

            {/* Article Footer & Author Box */}
            <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-agro-gold/20 border border-agro-gold/50 flex items-center justify-center text-agro-gold font-bold">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{article.author}</h4>
                  <p className="text-[11px] text-muted-foreground">Equipe Editorial • Painel do Agronegócio</p>
                </div>
              </div>

              <Link
                to="/artigos"
                className="text-xs text-agro-gold hover:underline inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Ver todos os artigos
              </Link>
            </div>
          </article>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-heading text-gold-gradient flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-agro-gold" />
                Artigos Relacionados
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    className="glass-card rounded-xl overflow-hidden flex flex-col h-full hover:border-agro-gold/40 transition-all duration-300 group"
                  >
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={rel.imageUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/images/fallbacks/default-agro.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[10px] text-agro-gold font-medium mb-1">
                        {rel.categoryName}
                      </span>
                      <h4 className="text-sm font-bold font-heading text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-agro-gold transition-colors">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {rel.excerpt}
                      </p>
                      <Link
                        to={`/artigos/${rel.slug}`}
                        className="text-xs font-semibold text-agro-gold inline-flex items-center gap-1 mt-auto"
                      >
                        Ler artigo
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default ArtigoDetalhe;
