import { RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalLastUpdate } from "@/hooks/useDataUpdates";

const Header = () => {
  const location = useLocation();
  const globalLastUpdate = useGlobalLastUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevTimestamp, setPrevTimestamp] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <img
              src="/Logo.png"
              alt="Logo Painel do Agronegócio"
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-gold-gradient">
                Painel do Agronegócio
              </h1>
              <p className="text-sm text-muted-foreground max-w-[320px] md:max-w-[400px]">
                Plataforma com dados atualizados do agronegócio brasileiro: cotações, clima e notícias em tempo real.
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-wrap xl:flex-nowrap items-center justify-center lg:justify-end gap-1 sm:gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground py-1">
            <Link to="/" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Início</Link>
            <Link to="/artigos" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/artigos") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Artigos</Link>
            <Link to="/calculadoras" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/calculadoras") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Calculadoras</Link>
            <Link to="/sobre" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/sobre") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Sobre</Link>
            <Link to="/contato" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/contato") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Contato</Link>
            <Link to="/privacidade" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/privacidade") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Privacidade</Link>
            <Link to="/termos" className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${isActive("/termos") ? "font-bold text-agro-gold bg-agro-gold/10 border border-agro-gold/30" : "hover:text-agro-gold hover:bg-background/40"}`}>Termos</Link>
          </nav>

          {/* Update Indicator - shows timestamp from JSON files */}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
