import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import bgPattern from "@/assets/agro-wheat-bg.jpg";
import { ARTICLES_DATA, Article } from "@/data/articlesData";
import { Search, BookOpen, Clock, Calendar, User, ArrowRight, Tag } from "lucide-react";

const categoriesList = [
  { id: "todos", name: "Todos os Artigos" },
  { id: "graos", name: "Grãos & Mercado" },
  { id: "cooxupe", name: "Cafeicultura" },
  { id: "gado-corte", name: "Pecuária de Corte" },
  { id: "leite", name: "Pecuária Leiteira" },
  { id: "fertilizantes", name: "Fertilizantes & Solo" },
  { id: "defensivos", name: "Defensivos & Proteção" },
  { id: "maquinas-irrigacao", name: "Máquinas & Irrigação" },
  { id: "inovacao-agro", name: "Inovação & Tecnologia" }
];

const Artigos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  const filteredArticles = ARTICLES_DATA.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "todos" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredArticle = ARTICLES_DATA[0];

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

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="container mx-auto px-4 pt-72 sm:pt-56 lg:pt-40 pb-16 flex-grow">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agro-gold/10 border border-agro-gold/30 text-agro-gold text-xs font-semibold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Conhecimento Técnico e Estratégico
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-heading text-gold-gradient mb-4 pb-2 pt-1 leading-normal">
              Artigos & Análises do Agronegócio
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Conteúdos práticos, análises de mercado, guias de manejo e inovações para otimizar os resultados da sua propriedade rural.
            </p>
          </div>

          {/* Search and Category Filters */}
          <div className="glass-panel p-4 md:p-6 mb-10 rounded-xl space-y-4">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar por títulos, assuntos ou palavras-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background/60 border border-border/60 rounded-lg text-sm focus:outline-none focus:border-agro-gold transition-colors placeholder:text-muted-foreground/70"
              />
            </div>

            {/* Category Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-2">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-agro-gold text-background font-semibold shadow-md"
                      : "bg-background/40 hover:bg-background/80 text-muted-foreground border border-border/40"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Article (when no search or category filter applied) */}
          {selectedCategory === "todos" && !searchTerm && featuredArticle && (
            <div
              className="glass-card mb-12 overflow-hidden rounded-2xl border border-agro-gold/30 hover:border-agro-gold/60 transition-all duration-300 group block"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-[380px] overflow-hidden">
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent lg:hidden" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-agro-gold text-background font-bold text-xs rounded-full uppercase tracking-wide">
                      Destaque da Semana
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-xs text-agro-gold-light mb-3">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {featuredArticle.categoryName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-3 leading-snug group-hover:text-agro-gold transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3.5 h-3.5 text-agro-gold" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <Link
                      to={`/artigos/${featuredArticle.slug}`}
                      className="btn-gold inline-flex items-center gap-2 text-xs font-semibold px-4 py-2"
                    >
                      Ler Artigo
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="glass-card flex flex-col h-full rounded-xl overflow-hidden hover:border-agro-gold/50 transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/fallbacks/default-agro.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/80 backdrop-blur-md text-agro-gold border border-agro-gold/30 text-[11px] font-medium rounded-md">
                      {article.categoryName}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-agro-gold" />
                        {article.publishedAt.split('-').reverse().join('/')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-agro-gold" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-heading text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-agro-gold transition-colors">
                      {article.title}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-auto">
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {article.author}
                      </span>
                      <Link
                        to={`/artigos/${article.slug}`}
                        className="text-xs font-semibold text-agro-gold hover:text-agro-gold-light inline-flex items-center gap-1 transition-colors"
                      >
                        Ler mais
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center rounded-xl my-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                Nenhum artigo encontrado
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Não encontramos artigos correspondentes à busca "{searchTerm}". Tente pesquisar com termos mais genéricos.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("todos");
                }}
                className="btn-gold text-xs px-4 py-2"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Artigos;
