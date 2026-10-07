import { Newspaper, LineChart, BellRing, Clock3, ArrowUpRight, Youtube } from "lucide-react";
import { YOUTUBE_CONFIG, getYouTubeSubscribeUrl } from "@/config/youtube";

const FEATURES = [
  { icon: Newspaper, title: "Notícias do agro", text: "Mercado, clima, café, grãos e pecuária." },
  { icon: LineChart, title: "Análise ao final", text: "Uma leitura clara do impacto para o produtor." },
  { icon: Clock3, title: "Direto ao ponto", text: "Conteúdo objetivo para assistir onde estiver." },
];

const YouTubeChannelSection = () => {
  const subscribeUrl = getYouTubeSubscribeUrl();

  return (
    <section id="canal-youtube" aria-labelledby="youtube-section-title" className="mb-10 sm:mb-12">
      <div className="yt-border rounded-2xl">
        <div className="yt-section rounded-2xl p-4 sm:p-8 lg:p-10">
          <div className="yt-glow yt-glow--red" aria-hidden="true" />
          <div className="yt-glow yt-glow--gold" aria-hidden="true" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-5 order-2 lg:order-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="yt-badge"><span className="yt-live-dot" aria-hidden="true" />Novos vídeos toda semana</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agro-gold/10 border border-agro-gold/30 text-agro-gold text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Canal oficial</span>
              </div>
              <h2 id="youtube-section-title" className="text-xl sm:text-3xl lg:text-[2.1rem] font-extrabold font-heading">
                <span className="block text-gold-gradient">O agronegócio em vídeo</span>
                <span className="mt-3 block text-foreground">
                  <span className="block">com análise e informações para</span>
                  <span className="mt-2 block">ajudar você no seu negócio!</span>
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                Acompanhe o {YOUTUBE_CONFIG.channelName} no <span className="yt-text-red font-semibold">YouTube</span>. Notícias e análises para decisões mais seguras no campo.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {FEATURES.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="yt-feature">
                    <span className="yt-feature-icon"><Icon className="w-4 h-4" /></span>
                    <div><p className="text-sm font-semibold text-foreground leading-tight">{title}</p><p className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-1">{text}</p></div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <a id="youtube-subscribe-button" href={subscribeUrl} target="_blank" rel="noopener noreferrer" aria-label="Conhecer e se inscrever no canal do Painel do Agronegócio" className="yt-btn w-full sm:w-auto">
                  <Youtube className="w-6 h-6 text-white yt-btn-logo" />
                  <span className="flex flex-col items-start leading-tight"><span>Conheça nosso canal</span><span className="text-[10px] font-medium text-white/75">Vídeos, notícias e análises</span></span>
                  <ArrowUpRight className="w-4 h-4 opacity-80" />
                </a>
                <p className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground"><BellRing className="w-4 h-4 text-agro-gold yt-bell shrink-0" />Ative o sininho e não perca nenhum vídeo.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2 min-w-0">
              <div className="yt-player group">
                <video className="absolute inset-0 h-full w-full object-cover" controls playsInline preload="auto" aria-label="Vídeo de apresentação do Painel do Agronegócio">
                  <source src="/videos/video-de-abertura-v2.mp4" type="video/mp4" />
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeChannelSection;
