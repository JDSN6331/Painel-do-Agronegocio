import { RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGlobalLastUpdate } from "@/hooks/useDataUpdates";

const Header = () => {
  const globalLastUpdate = useGlobalLastUpdate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevTimestamp, setPrevTimestamp] = useState<string | null>(null);

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
          <nav className="flex items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-agro-gold transition-colors block py-2">Início</Link>
            <Link to="/sobre" className="hover:text-agro-gold transition-colors block py-2">Sobre</Link>
            <Link to="/contato" className="hover:text-agro-gold transition-colors block py-2">Contato</Link>
            <Link to="/privacidade" className="hover:text-agro-gold transition-colors block py-2">Privacidade</Link>
          </nav>

          {/* Update Indicator - shows timestamp from JSON files */}
          <div className="flex items-center justify-center gap-3">
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
