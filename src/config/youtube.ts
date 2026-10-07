/**
 * Configuração do canal oficial do Painel do Agronegócio no YouTube.
 *
 * ➜ Quando o canal for criado, basta preencher `channelUrl` com o link
 *   (ex.: "https://www.youtube.com/@PainelDoAgronegocio").
 *   O texto da seção já apresenta o canal como ativo; enquanto o link
 *   estiver vazio, apenas o redirecionamento fica desativado.
 *
 * ➜ `subscribeUrl` é opcional. Se vazio, é gerado automaticamente a partir
 *   de `channelUrl` adicionando `?sub_confirmation=1`, que abre o pop-up
 *   de inscrição do YouTube.
 */
export const YOUTUBE_CONFIG = {
  channelUrl: "https://www.youtube.com/channel/UC0-UvV346DnVo-56bwlY9Yg",
  subscribeUrl: "",
  channelName: "Painel do Agronegócio",
};

export const isYouTubeChannelAvailable = (): boolean =>
  YOUTUBE_CONFIG.channelUrl.trim().length > 0;

export const getYouTubeSubscribeUrl = (): string => {
  if (YOUTUBE_CONFIG.subscribeUrl.trim()) return YOUTUBE_CONFIG.subscribeUrl;
  const base = YOUTUBE_CONFIG.channelUrl.trim();
  if (!base) return "";
  return `${base}${base.includes("?") ? "&" : "?"}sub_confirmation=1`;
};
