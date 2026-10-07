import { RefreshCw, CheckCircle, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalLastUpdate } from "@/hooks/useDataUpdates";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/artigos", label: "Artigos" },
  { to: "/calculadoras", label: "Calculadoras" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/termos", label: "Termos" },
];

const Header = () => {
  const location = useLocation();
  const globalLastUpdate = useGlobalLastUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevTimestamp, setPrevTimestamp] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // Expose the real header height as a CSS variable (--header-height) so page
  // content can be offset precisely on every screen size (see .pt-header).
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty("--header-height", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Show updating animation when timestamp changes
  useEffect(() => {
    if (globalLastUpdate && globalLastUpdate !== prevTimestamp) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setPrevTimestamp(globalLastUpdate);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [globalLastUpdate, prevTimestamp]);

  // Format the timestamp from JSON for display
  // Shows date if not today, otherwise just time
  const formatLastUpdate = (isoString: string | null) => {
    if (!isoString) return null; // Return null to show loading state
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        });
      } else {
        // Show date and time if not today
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
    } catch {
      return null;
    }
  };

  const formattedTime = formatLastUpdate(globalLastUpdate);

  const linkClass = (path: string) =>
    `px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive(path)
      ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30"
      : "hover:text-agro-gold hover:bg-background/40"
    }`;

  /** Full update indicator (desktop + mobile menu) */
  const UpdateIndicator = () => (
    <div className="flex items-center justify-center lg:justify-end gap-2.5 whitespace-nowrap shrink-0">
      {isUpdating ? (
        <>
          <RefreshCw className="w-4 h-4 text-agro-gold animate-spin" />
          <span className="text-sm text-agro-gold font-medium">
            Atualizando dados...
          </span>
        </>
      ) : formattedTime ? (
        <>
          <CheckCircle className="w-4 h-4 text-agro-gold" />
          <span className="text-sm text-muted-foreground">
            <span className="font-bold">Última atualização:</span> {formattedTime}
          </span>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-2 h-2 rounded-full bg-agro-gold animate-pulse" />
            <span className="text-xs text-agro-gold">Online</span>
          </div>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
          <span className="text-sm text-muted-foreground">
            Carregando dados...
          </span>
        </>
      )}
    </div>
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0"
    >
      <div className="container mx-auto px-3 sm:px-4 py-2.5 lg:py-4">
        <div className="flex items-center justify-between gap-3 lg:gap-4">
          {/* Title Section */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-4 min-w-0" aria-label="Painel do Agronegócio - Início">
            <img
              src="/Logo.png"
              alt="Logo Painel do Agronegócio"
              className="w-11 h-11 sm:w-14 sm:h-14 lg:w-20 lg:h-20 object-contain shrink-0"
            />
            <div className="flex flex-col items-start text-left gap-0.5 lg:gap-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold font-heading text-gold-gradient leading-tight truncate">
                Painel do Agronegócio
              </h1>
              <p className="hidden md:block text-xs lg:text-sm text-muted-foreground max-w-[400px]">
                Plataforma com dados atualizados do agronegócio brasileiro: cotações, clima e notícias em tempo real.
              </p>
            </div>
          </Link>

          {/* Desktop: Navigation + indicator */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <nav className="flex flex-wrap xl:flex-nowrap items-center justify-end gap-1.5 xl:gap-2 text-sm text-muted-foreground py-1" aria-label="Menu principal">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className={linkClass(to)}>{label}</Link>
              ))}
            </nav>
            <UpdateIndicator />
          </div>

          {/* Mobile: compact status + menu toggle */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {isUpdating || !formattedTime ? (
                <RefreshCw className="w-3.5 h-3.5 text-agro-gold animate-spin" />
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-agro-gold animate-pulse" />
                  {formattedTime}
                </>
              )}
            </span>
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-agro-gold/30 bg-agro-gold/10 text-agro-gold transition-colors hover:bg-agro-gold/20"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (absolute, so it doesn't change the measured header height) */}
      <div
        id="mobile-menu"
        className={`lg:hidden absolute left-0 right-0 top-full glass-panel rounded-none border-x-0 border-t-0 bg-background/95 transition-all duration-300 origin-top ${menuOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-95 invisible pointer-events-none"
          }`}
      >
        <nav className="container mx-auto px-3 sm:px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground" aria-label="Menu principal (mobile)">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={`${linkClass(to)} text-center py-2`}>{label}</Link>
          ))}
        </nav>
        <div className="container mx-auto px-3 sm:px-4 pb-3">
          <UpdateIndicator />
        </div>
      </div>
    </header>
  );
};

export default Header;
