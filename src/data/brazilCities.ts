export interface CityOption {
  city: string;
  state: string; // UF (ex.: "MG")
  lat: number;
  lon: number;
}

/** Nome do estado (como retornado pelas APIs de geocodificação) -> UF */
export const STATE_TO_UF: Record<string, string> = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Federal District": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
};

export function toUF(stateName?: string): string {
  if (!stateName) return "";
  if (/^[A-Z]{2}$/.test(stateName)) return stateName;
  return STATE_TO_UF[stateName] ?? stateName;
}

/**
 * Cidades sugeridas exibidas na picklist antes de o usuário digitar.
 * Foco na área de atuação da Cooxupé (Sul de Minas, Cerrado Mineiro,
 * Média Mogiana/SP e Matas de Minas), em ordem alfabética.
 * Obs.: Guaxupé/MG, São José do Rio Pardo/SP e Patrocínio/MG já aparecem
 * nos cards fixos do painel.
 */
export const SUGGESTED_CITIES: CityOption[] = [
  { city: "Alfenas", state: "MG", lat: -21.4292, lon: -45.9472 },
  { city: "Alpinópolis", state: "MG", lat: -20.8636, lon: -46.3881 },
  { city: "Alterosa", state: "MG", lat: -21.2492, lon: -46.1431 },
  { city: "Altinópolis", state: "SP", lat: -21.0256, lon: -47.3739 },
  { city: "Andradas", state: "MG", lat: -22.0681, lon: -46.5692 },
  { city: "Araguari", state: "MG", lat: -18.6472, lon: -48.1872 },
  { city: "Areado", state: "MG", lat: -21.3586, lon: -46.1456 },
  { city: "Botelhos", state: "MG", lat: -21.6333, lon: -46.395 },
  { city: "Cabo Verde", state: "MG", lat: -21.4719, lon: -46.3961 },
  { city: "Caconde", state: "SP", lat: -21.5294, lon: -46.6439 },
  { city: "Campestre", state: "MG", lat: -21.7111, lon: -46.2464 },
  { city: "Campos Altos", state: "MG", lat: -19.6961, lon: -46.1714 },
  { city: "Campos Gerais", state: "MG", lat: -21.235, lon: -45.7586 },
  { city: "Carmo do Rio Claro", state: "MG", lat: -20.9719, lon: -46.1189 },
  { city: "Cássia", state: "MG", lat: -20.5831, lon: -46.9219 },
  { city: "Conceição da Aparecida", state: "MG", lat: -21.0942, lon: -46.2044 },
  { city: "Coromandel", state: "MG", lat: -18.4733, lon: -47.2003 },
  { city: "Guaranésia", state: "MG", lat: -21.2992, lon: -46.8025 },
  { city: "Jacuí", state: "MG", lat: -21.0167, lon: -46.7411 },
  { city: "Juruaia", state: "MG", lat: -21.2528, lon: -46.5769 },
  { city: "Manhuaçu", state: "MG", lat: -20.2581, lon: -42.0336 },
  { city: "Mococa", state: "SP", lat: -21.4678, lon: -47.0047 },
  { city: "Monte Belo", state: "MG", lat: -21.3264, lon: -46.3675 },
  { city: "Monte Carmelo", state: "MG", lat: -18.7247, lon: -47.4986 },
  { city: "Monte Santo de Minas", state: "MG", lat: -21.1897, lon: -46.9803 },
  { city: "Muzambinho", state: "MG", lat: -21.3758, lon: -46.5256 },
  { city: "Nova Resende", state: "MG", lat: -21.1261, lon: -46.4203 },
  { city: "Poços de Caldas", state: "MG", lat: -21.7878, lon: -46.5614 },
  { city: "Rio Paranaíba", state: "MG", lat: -19.1936, lon: -46.2472 },
  { city: "São Pedro da União", state: "MG", lat: -21.1267, lon: -46.6153 },
  { city: "São Sebastião da Grama", state: "SP", lat: -21.7106, lon: -46.8208 },
  { city: "São Sebastião do Paraíso", state: "MG", lat: -20.9169, lon: -46.9914 },
  { city: "Serra do Salitre", state: "MG", lat: -19.1114, lon: -46.6897 },
  { city: "Socorro", state: "SP", lat: -22.5914, lon: -46.5289 },
  { city: "Três Corações", state: "MG", lat: -21.6969, lon: -45.2533 },
  { city: "Varginha", state: "MG", lat: -21.5514, lon: -45.4303 },
];

