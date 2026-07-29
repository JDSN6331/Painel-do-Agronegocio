import { Link } from "react-router-dom";
import { BookOpen, Shield, FileText, Mail, Info, Calculator, Home } from "lucide-react";

const Footer = () => {
  return (
    <footer className="glass-panel rounded-none border-x-0 border-b-0 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          {/* Coluna 1: Sobre */}
          <div className="space-y-3">
            <h3 className="text-base font-bold font-heading text-agro-gold flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-agro-gold" />
              Painel do Agronegócio
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma de inteligência e informação para o agronegócio brasileiro: cotações em tempo real, meteorologia, ferramentas agrícolas e artigos orientativos.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  Início
                </Link>
              </li>
              <li>
                <Link to="/artigos" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Artigos & Análises
                </Link>
              </li>
              <li>
                <Link to="/calculadoras" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  Calculadoras Agrícolas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Institucional
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/sobre" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-agro-gold transition-colors inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Aviso Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Transparência
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              As cotações e dados meteorológicos são obtidos de fontes públicas e APIs abertas. As notícias externas são agregadas via RSS e pertencem aos seus respectivos veículos.
            </p>
          </div>
        </div>

        <hr className="border-muted-foreground/20 my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <p>© 2026 Painel do Agronegócio. Todos os direitos reservados.</p>
          <p>Redação • Painel do Agronegócio</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
