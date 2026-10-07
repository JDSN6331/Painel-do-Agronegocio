import { useEffect, useState } from "react";
import { Home, Newspaper, Calculator, Youtube, Download, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { YOUTUBE_CONFIG } from "@/config/youtube";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const MobileAppShell = () => {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("pwa-install-dismissed") === "1");

  useEffect(() => {
    const capture = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const itemClass = (active: boolean) => `mobile-nav-item ${active ? "mobile-nav-item--active" : ""}`;

  return (
    <>
      {installPrompt && !dismissed && (
        <aside className="mobile-install-card lg:hidden" aria-label="Instalar aplicativo">
          <img src="/Logo.png" alt="" className="w-10 h-10 object-contain" />
          <div className="min-w-0 flex-1"><p className="text-xs font-bold text-foreground">Tenha o Painel Agro no celular</p><p className="text-[10px] text-muted-foreground">Acesso rápido e funcionamento offline.</p></div>
          <button onClick={install} className="btn-gold !px-3 !py-2 text-[11px] inline-flex items-center gap-1"><Download className="w-3.5 h-3.5" />Instalar</button>
          <button onClick={dismiss} aria-label="Fechar" className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
        </aside>
      )}
      <nav className="mobile-bottom-nav lg:hidden" aria-label="Navegação do aplicativo">
        <Link to="/" className={itemClass(location.pathname === "/")}><Home /><span>Início</span></Link>
        <Link to="/artigos" className={itemClass(location.pathname.startsWith("/artigos"))}><Newspaper /><span>Artigos</span></Link>
        <Link to="/calculadoras" className={itemClass(location.pathname === "/calculadoras")}><Calculator /><span>Calcular</span></Link>
        <a href={YOUTUBE_CONFIG.channelUrl} target="_blank" rel="noopener noreferrer" className={itemClass(false)}><Youtube /><span>Canal</span></a>
      </nav>
    </>
  );
};

export default MobileAppShell;
