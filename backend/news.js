import Parser from 'rss-parser';
import puppeteer from 'puppeteer';

const parser = new Parser({
    customFields: {
        item: ['source']
    }
});

// List of user agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

/**
 * Get a random user agent
 */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Delay utility function
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max milliseconds
 */
function randomDelay(minMs, maxMs) {
    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return delay(delayTime);
}

// Progressive period sequence (in days) - starts with 1 day for freshest news
const PERIOD_SEQUENCE = [1, 3, 7, 10, 15, 21, 30];

// GLOBAL exclusions - terms that are NEVER relevant for agricultural news (any category)
// NOTE: These terms are matched as WHOLE WORDS to avoid false positives
// (e.g., "quina" would block "máquina", so we removed it)
const GLOBAL_EXCLUSIONS = [
    // Loteria e jogos de azar (removed 'quina' - conflicts with 'máquina')
    'mega da virada', 'mega-sena', 'megasena', 'loteria', 'lotofácil',
    'sorte grande', 'prêmio milionário', 'ganhador do prêmio',
    // Entretenimento e celebridades (removed 'ator' - conflicts with 'trator')
    'influenciador', 'influenciadora', 'influencer', 'digital influencer',
    'celebridade', 'famoso', 'famosa', 'bbb', 'big brother', 'reality show',
    'novela', 'atriz', 'cantor', 'cantora', 'artista',
    // Esportes (exceto contexto agrícola)
    'futebol', 'copa do mundo', 'olimpíadas',
    // Política partidária e governo (Eduardo Leite = governador RS, não produto leite)
    'eleição', 'eleições', 'candidato', 'deputado', 'senador', 'vereador',
    'eduardo leite', 'governador leite', 'leite autoriza', 'polícia penal',
    // Artigos exclusivamente sobre cotações/preços (não queremos em categorias de notícias)
    'cotações e informações', 'café em foco', 'fechamento do mercado'
];

// GEOGRAPHIC FILTER - Exclude news from other countries (not relevant for Brazilian agribusiness)
// These terms indicate the news is about another country's agriculture, not Brazilian
const FOREIGN_COUNTRY_EXCLUSIONS = [
    // Portugal (domains, cities and entities) - NOTE: some cities like Bragança exist in Brazil too
    'portugal', 'português', 'portuguesa', 'lisboa', 'porto pt', 'alentejo',
    'agricultura portugal', 'agricultores portugueses', 'cap portugal',
    // Portuguese cities (most don't exist in Brazil or are clearly in PT context)
    'leiria', 'coimbra', 'faro', 'braga', 'aveiro', 'viseu', 'guarda', 'setúbal',
    'évora', 'castelo branco', 'portalegre', 'beja', 'viana do castelo',
    // Portuguese news sources
    'cmjornal.pt', 'dn.pt', 'publico.pt', 'sapo.pt', 'rtp.pt', 'observador.pt',
    // Vietnam (frequent in coffee/rice news)
    'vietnã', 'vietnam', 'vietnamita', 'vietnamitas', 'hanoi', 'ho chi minh',
    // Vietnamese provinces (coffee/agriculture regions)
    'dak lak', 'daklak', 'gia lai', 'lam dong', 'central highlands vietnam',
    'kon tum', 'dak nong', 'binh phuoc',
    // Vietnamese news sources
    'vietnam.vn', 'vietnamplus', 'vnexpress', 'tuoitre.vn',
    // Argentina (frequent in soy/wheat news)
    'argentina', 'argentino', 'argentina safra', 'buenos aires', 'pampas argentinos',
    'córdoba argentina', 'santa fe argentina', 'entre ríos',
    // United States
    'estados unidos safra', 'usda', 'corn belt', 'iowa', 'illinois safra',
    'nebraska', 'kansas safra', 'midwest americano',
    // European Union agricultural news
    'união europeia pac', 'política agrícola comum', 'pac europeia',
    // Spain
    'españa', 'espanha', 'espanhol', 'madrid', 'andaluzia', 'catalunha',
    // China agricultural production
    'china produção agrícola', 'agricultura chinesa',
    // India
    'índia safra', 'agricultura indiana',
    // Ukraine/Russia (grain exports context)
    'ucrânia grãos', 'rússia trigo', 'mar negro exportação',
    // Paraguay (frequent in soy)
    'paraguai safra', 'paraguai soja', 'asunción',
    // Colombia (coffee)
    'colômbia café', 'café colombiano', 'bogotá'
];

// Foreign domain extensions - if URL contains these, it's likely foreign news
const FOREIGN_DOMAIN_EXTENSIONS = [
    '.pt/',  // Portugal
    '.pt?',
    'cmjornal.pt',
    'dn.pt',
    'publico.pt',
    '.vn/',  // Vietnam
    '.vn?',
    'vietnam.vn',
    'vnexpress.net',
    '.ar/',  // Argentina
    '.ar?',
    'clarin.com',
    'lanacion.com.ar',
    '.es/',  // Spain
    '.es?',
    '.py/',  // Paraguay
    '.py?',
    '.co/',  // Colombia (but careful - .com is different!)
    '.mx/',  // Mexico
    '.mx?'
];

// EXCLUDED AGGREGATOR SOURCES - These sites republish content with incorrect dates
// MSN, for example, shows the date it indexed the article, not the original publication date
const EXCLUDED_AGGREGATOR_SOURCES = [
    'msn.com',
    'www.msn.com'
];

// Terms indicating the news source is specifically about foreign context (not just mentioning Brazil exports TO these places)
const FOREIGN_CONTEXT_PATTERNS = [
    // Headlines starting with country names (foreign focus)
    /^portugal:/i,
    /^vietnã:/i,
    /^vietnam:/i,
    /^argentina:/i,
    /^eua:/i,
    /^china:/i,
    /^índia:/i,
    // "Em Portugal", "Na Argentina" etc at the start
    /^em portugal/i,
    /^na argentina/i,
    /^no vietnã/i,
    /^no vietnam/i,
    /^nos estados unidos/i,
    /^na china/i,
    // Agriculture of other countries
    /agricultura (de |do |da )?(portugal|argentina|vietnã|vietnam|china|índia|eua)/i,
    /safra (de |do |da )?(portugal|argentina|vietnã|vietnam|china|índia|eua|americana|chinesa)/i,
    /produtores (de |do |da )?(portugal|argentinos|vietnamitas|chineses|indianos|americanos)/i,
    // Portuguese districts combined with accident/news context
    /(bragança|leiria|santarém|coimbra|faro|aveiro).*(portugal|distrito|região)/i,
    /distritos?.*(bragança|leiria|santarém|coimbra|faro)/i,
    // Vietnamese provinces
    /(dak lak|gia lai|lam dong|kon tum).*vietnam/i
];

// BRAZILIAN SOURCES - Known reliable Brazilian agricultural news sources
// News from these sources gets priority and automatic Brazilian context validation
const BRAZILIAN_AGRO_SOURCES = [
    'notícias agrícolas', 'noticias agricolas', 'canal rural', 'globo rural',
    'agrolink', 'agrofy', 'embrapa', 'conab', 'cna brasil', 'aprosoja',
    'abraleite', 'abiec', 'mapa', 'cecafé', 'cepea', 'esalq', 'usp',
    'udop', 'unica', 'valor econômico', 'infomoney', 'exame', 'forbes brasil',
    'g1', 'uol', 'estadão', 'folha', 'terra', 'r7', 'band', 'sbt',
    'gazeta do povo', 'correio braziliense', 'jornal do commercio',
    'diário do nordeste', 'zero hora', 'a gazeta', 'o tempo', 'em.com.br'
];

// BRAZILIAN CONTEXT TERMS - At least one must be present if the source is not known Brazilian
const BRAZILIAN_CONTEXT_KEYWORDS = [
    // Brazilian states
    'brasil', 'brasileiro', 'brasileira', 'brasileiros', 'brasileiras',
    'mato grosso', 'goiás', 'paraná', 'rio grande do sul', 'minas gerais',
    'são paulo', 'bahia', 'tocantins', 'maranhão', 'piauí', 'rondônia',
    'mato grosso do sul', 'santa catarina', 'pará', 'roraima', 'acre',
    'amazonas', 'amapá', 'rio de janeiro', 'espírito santo', 'sergipe',
    'alagoas', 'pernambuco', 'ceará', 'rio grande do norte', 'paraíba',
    // State abbreviations
    'mt', 'ms', 'go', 'pr', 'rs', 'sc', 'mg', 'sp', 'ba', 'to', 'ma', 'pi',
    // Brazilian regions and cities known for agribusiness
    'cerrado', 'matopiba', 'triângulo mineiro', 'oeste baiano', 'sul goiano',
    'norte paranaense', 'oeste catarinense', 'campanha gaúcha', 'pampa',
    'sorriso', 'lucas do rio verde', 'rondonópolis', 'dourados', 'rio verde',
    'uberlândia', 'uberaba', 'patos de minas', 'cascavel', 'londrina',
    'maringá', 'porto alegre', 'cuiabá', 'campo grande', 'goiânia',
    // Brazilian institutions and companies
    'embrapa', 'conab', 'mapa', 'cna', 'aprosoja', 'abraleite', 'abiec',
    'cepea', 'esalq', 'petrobras', 'bndes', 'banco do brasil', 'caixa',
    // Brazilian agricultural terms
    'plano safra', 'crédito rural', 'pronaf', 'pronamp', 'custeio',
    'funcafé', 'pgpm', 'pepro', 'venda casada',
    // Export context FROM Brazil
    'exportação brasileira', 'exportações brasileiras', 'porto de santos',
    'porto de paranaguá', 'porto do rio grande', 'corredor de exportação'
];

/**
 * Check if a term exists as a whole word in the text (not as substring)
 * This prevents false positives like 'quina' matching 'máquina'
 */
function containsWholeWord(text, word) {
    // Escape special regex characters in the word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Create regex with word boundaries (\b doesn't work well with accented chars, so use \s and punctuation)
    const regex = new RegExp(`(^|[\\s.,;:!?()\"'\\-])${escapedWord}([\\s.,;:!?()\"'\\-]|$)`, 'i');
    return regex.test(text);
}

/**
 * Check if the news source is a known Brazilian source
 */
function isFromBrazilianSource(sourceName) {
    if (!sourceName) return false;
    const lowerSource = sourceName.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return BRAZILIAN_AGRO_SOURCES.some(source => {
        const normalizedSource = source.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return lowerSource.includes(normalizedSource);
    });
}

/**
 * Check if the URL is from a foreign domain (not Brazilian)
 */
function isFromForeignDomain(url, sourceName) {
    if (!url && !sourceName) return false;

    const textToCheck = `${url || ''} ${sourceName || ''}`.toLowerCase();

    // Check for foreign domain patterns
    for (const pattern of FOREIGN_DOMAIN_EXTENSIONS) {
        if (textToCheck.includes(pattern.toLowerCase())) {
            console.log(`        🌍 Foreign domain detected: "${pattern}"`);
            return true;
        }
    }

    // Additional check for source name containing obvious foreign indicators
    const foreignSourceIndicators = ['.pt', '.vn', '.ar', '.es', '.py', '.mx', 'portugal', 'vietnam'];
    for (const indicator of foreignSourceIndicators) {
        if (textToCheck.includes(indicator)) {
            console.log(`        🌍 Foreign source indicator: "${indicator}"`);
            return true;
        }
    }

    return false;
}

/**
 * Check if the article has foreign country focus (not Brazilian)
 * Now also checks URL and source name for foreign domains
 * Returns true if foreign focus detected, false otherwise
 */
function hasForeignCountryFocus(title, summary, articleUrl = null, sourceName = null) {
    // FIRST: Check if article URL or source is from a foreign domain
    // This is the most reliable indicator
    if (isFromForeignDomain(articleUrl, sourceName)) {
        return true;
    }

    const textToCheck = `${title || ''} ${summary || ''}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const originalText = `${title || ''} ${summary || ''}`;

    // Check regex patterns first (headlines starting with foreign countries, etc.)
    for (const pattern of FOREIGN_CONTEXT_PATTERNS) {
        if (pattern.test(originalText)) {
            console.log(`        🌍 Foreign context pattern matched`);
            return true;
        }
    }

    // Check for foreign country terms
    for (const term of FOREIGN_COUNTRY_EXCLUSIONS) {
        const normalizedTerm = term.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // For single country names, check if they appear WITHOUT Brazilian context
        if (textToCheck.includes(normalizedTerm)) {
            // Exception: If the text also mentions Brazil in an export/trade context, it's OK
            // e.g., "Brasil exporta mais café para Vietnã" is Brazilian news
            const brazilExportTerms = ['brasil export', 'exportacao brasileira', 'brasil vend',
                'importa do brasil', 'compra do brasil', 'brasil fornec'];
            const hasBrazilExportContext = brazilExportTerms.some(et => textToCheck.includes(et));

            if (!hasBrazilExportContext) {
                console.log(`        🌍 Foreign country term found: "${term}"`);
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if the article has Brazilian context
 * News from known Brazilian sources automatically pass
 */
function hasBrazilianContext(title, summary, sourceName) {
    // Known Brazilian sources automatically have Brazilian context
    if (isFromBrazilianSource(sourceName)) {
        return true;
    }

    const textToCheck = `${title || ''} ${summary || ''}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    for (const term of BRAZILIAN_CONTEXT_KEYWORDS) {
        const normalizedTerm = term.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (textToCheck.includes(normalizedTerm)) {
            return true;
        }
    }

    return false;
}

// Terms that indicate AGRICULTURAL CONTEXT - at least one must be present
// This prevents false positives like "Paulinha Leite" (person) vs "leite" (dairy)
const AGRICULTURAL_CONTEXT_KEYWORDS = [
    // Termos de negócio/mercado agrícola
    'safra', 'safrinha', 'entressafra', 'colheita', 'plantio', 'produção',
    'preço', 'cotação', 'mercado', 'commodity', 'commodities',
    'exportação', 'importação', 'comercialização',
    // Termos de propriedade/atividade rural (removed 'campo' - conflicts with sports fields)
    'fazenda', 'fazendeiro', 'rural', 'homem do campo', 'propriedade rural',
    'agro', 'agropecuária', 'agropecuário', 'agronegócio', 'agricultura',
    'pecuária', 'pecuarista', 'produtor', 'produtores',
    // Termos técnicos
    'hectare', 'hectares', 'ha', 'tonelada', 'toneladas', 'saca', 'sacas',
    'arroba', 'litro', 'litros', 'cabeça', 'cabeças', 'rebanho',
    // Instituições do setor
    'embrapa', 'conab', 'mapa', 'cna', 'aprosoja', 'abiec', 'abraleite',
    // Regiões produtoras
    'cerrado', 'matopiba',
    // Termos intrinsecamente agrícolas - irrigação e máquinas
    'irrigação', 'pivô', 'gotejamento', 'aspersão', 'fertirrigação',
    'trator', 'tratores', 'colheitadeira', 'plantadeira', 'pulverizador',
    // Financiamento agrícola
    'crédito rural', 'financiamento agrícola', 'plano safra', 'custeio agrícola'
];

// Terms to EXCLUDE from each category (blacklist)
const CATEGORY_EXCLUSIONS = {
    'defensivos': [
        // Contexto urbano (dengue, fumacê, etc.) - pode usar termos agrícolas mas em contexto de saúde pública
        'dengue', 'fumacê', 'fumace', 'aedes', 'rota do fumacê'
    ],
    'maquinas': [
        'gado', 'boi', 'vaca', 'bezerro', 'contrato fazendeiro',
        'tributária', 'imposto', 'reforma tributária', 'ibs', 'cbs',
        'leite', 'pecuária'
    ],
    'irrigacao': [
        'gado', 'boi', 'vaca', 'bezerro', 'contrato fazendeiro',
        'tributária', 'imposto', 'reforma tributária', 'ibs', 'cbs',
        'leite', 'pecuária'
    ]
};

// Terms that MUST be present for an article to be relevant (positive validation)
// At least ONE of these must appear in title+summary
const CATEGORY_REQUIRED_KEYWORDS = {
    'defensivos': [
        // Tipos de defensivos agrícolas
        'herbicida', 'herbicidas', 'plantas daninhas', 'daninhas',
        'inseticida', 'inseticidas', 'lagarta', 'lagartas', 'percevejo', 'percevejos', 'pulgão', 'pulgões',
        'fungicida', 'fungicidas', 'fungo', 'fungos',
        'acaricida', 'acaricidas', 'ácaro', 'ácaros',
        'nematicida', 'nematicidas', 'nematoide', 'nematoides', 'nematóide', 'nematóides',
        'bactericida', 'bactericidas',
        'rodenticida', 'rodenticidas',
        // Termo principal
        'defensivo agrícola', 'defensivos agrícolas',
        // Termos relacionados da query de busca (para validar contexto agrícola)
        'bioinsumo', 'bioinsumos', 'pré-emergente', 'pré-emergentes'
    ],
    'fertilizantes': [
        // Tipos de fertilizantes
        'fertilizante', 'fertilizantes',
        'fertilizante de solo', 'fertilizantes de solo',
        'fertilizante foliar', 'fertilizantes foliar', 'nutrição foliar',
        'biofertilizante', 'biofertilizantes',
        'fertilizante organomineral', 'fertilizantes organominerais',
        'fertilizante orgânico', 'fertilizantes orgânicos',
        'fertilizante mineral', 'fertilizantes minerais',
        // Termos relacionados da query de busca
        'adubação', 'adubação de precisão', 'ureia', 'ureia protegida',
        'fixação biológica', 'fixação de nitrogênio', 'remineralizador', 'remineralizadores'
    ],
    'maquinas': [
        // Máquinas agrícolas
        'trator', 'tratores', 'colheitadeira', 'colheitadeiras', 'colhedora', 'colhedoras',
        'plantadeira', 'plantadeiras', 'semeadora', 'semeadoras',
        'pulverizador', 'pulverizadores', 'pulverização',
        'máquina agrícola', 'máquinas agrícolas', 'maquinário agrícola',
        'implemento', 'implementos', 'implemento agrícola',
        // Marcas conhecidas
        'john deere', 'massey ferguson', 'new holland', 'case ih', 'valtra', 'jacto'
    ],
    'irrigacao': [
        // Sistemas de irrigação
        'irrigação', 'irrigar', 'irrigado', 'irrigada',
        'pivô central', 'pivô', 'gotejamento', 'aspersão',
        'microaspersão', 'fertirrigação', 'manejo de água',
        'sistema de irrigação', 'lâmina de água', 'déficit hídrico'
    ],
    'cafe': [
        // Café
        'café', 'cafeicultura', 'cafeicultor', 'cafeicultores',
        'cafezal', 'cafezais', 'arábica', 'robusta', 'conilon',
        'saca de café', 'sacas de café', 'colheita de café',
        'exportação de café', 'preço do café'
    ],
    'milho': [
        // Milho
        'milho', 'milharal', 'safrinha', 'safrinha de milho',
        'saca de milho', 'sacas de milho', 'colheita de milho',
        'exportação de milho', 'preço do milho', 'plantio de milho'
    ],
    'soja': [
        // Soja
        'soja', 'sojicultura', 'sojicultor', 'sojicultores',
        'saca de soja', 'sacas de soja', 'colheita de soja',
        'exportação de soja', 'preço da soja', 'plantio de soja',
        'farelo de soja', 'óleo de soja'
    ],
    'gado-corte': [
        // Gado de corte
        'gado de corte', 'boi gordo', 'boi magro', 'novilho', 'novilha',
        'arroba', 'arroba do boi', '@', 'abate', 'abatedouro', 'frigorífico',
        'pecuária de corte', 'confinamento', 'nelore', 'angus', 'zebu',
        'carne bovina', 'exportação de carne', 'preço do boi'
    ],
    'leite': [
        // Leite e derivados
        'leite', 'lácteo', 'lácteos', 'leiteiro', 'leiteira',
        'pecuária leiteira', 'gado leiteiro', 'vaca leiteira',
        'laticínio', 'laticínios', 'ordenha',
        'litro de leite', 'preço do leite', 'produção de leite',
        'queijo', 'iogurte', 'manteiga', 'derivados do leite'
    ],
    'cooxupe': [
        // Cooxupé - Cooperativa de café
        'cooxupé', 'cooxupe'
    ],
    'inovacao-agro': [
        // Inovação e tecnologia no agronegócio - termos ESPECÍFICOS (sem genéricos)
        'agtech', 'agritech', 'agricultura de precisão', 'agricultura digital', 'agricultura 4.0',
        'drone', 'drones', 'vant', 'pulverização aérea', 'pulverização inteligente',
        'inteligência artificial', 'machine learning', 'visão computacional', 'deep learning',
        'iot', 'internet das coisas', 'sensor', 'sensores', 'telemetria', 'gps agrícola',
        'startup agro', 'startups agro', 'inovação', 'tecnologia', 'digital',
        'automação', 'robô', 'robôs', 'robótica', 'autônomo', 'autônoma', 'trator autônomo',
        'colheitadeira inteligente', 'pulverizador autônomo', 'piloto automático',
        'big data', 'analytics', 'plataforma digital', 'algoritmo',
        'rastreabilidade', 'blockchain', 'conectividade rural',
        'satélite', 'imagem de satélite', 'sensoriamento remoto', 'mapeamento aéreo'
    ]
};

// Categories with their Google News RSS feeds (period is added dynamically)
const CATEGORY_FEEDS = [
    {
        id: 'cooxupe',
        title: 'Cooxupé em Destaque',
        searchQuery: '"Cooxupé"+OR+"cooperativa+Cooxupé"+OR+"café+Cooxupé"',
        // Pular validações regulares (contexto agrícola, geográfico, etc.)
        skipValidations: true,
        // Verificar "Cooxupé" no título OU resumo
        checkKeywordInTitleOrSummary: true,
        // Cota especial: 4 notícias (layout carrossel)
        newsQuota: 4
    },
    {
        id: 'inovacao-agro',
        title: 'Inovação no Agro',
        // Query simplificada para resultados mais diversos e recentes
        searchQuery: 'tecnologia+agronegócio+OR+inovação+agronegócio+OR+drone+agricultura+OR+automação+agrícola',
        // Cota especial: 4 notícias (layout carrossel)
        newsQuota: 4
    },
    {
        id: 'defensivos',
        title: 'Defensivos',
        // Query original - exclusões filtram contexto urbano
        searchQuery: 'bioinsumos+OR+pré-emergentes+OR+defensivos+OR+inseticida+OR+acaricida+OR+fungicida+OR+nematicida+OR+herbicida'
    },
    {
        id: 'fertilizantes',
        title: 'Fertilizantes',
        searchQuery: '"adubação+de+precisão"+OR+"fertilizantes+organominerais"+OR+"nutrição+foliar"+OR+"fixação+biológica+de+nitrogênio"+OR+"remineralizadores+de+solo"+OR+"ureia+protegida"+OR+fertilizantes'
    },
    {
        id: 'maquinas-irrigacao',
        title: 'Máquinas/Irrigação',
        // This category uses subcategories with quotas
        subcategories: [
            {
                subId: 'maquinas',
                searchQuery: 'tratores+OR+colheitadeira+OR+plantadeira+OR+pulverizador+agrícola+OR+máquinas+agrícolas',
                quota: 2
            },
            {
                subId: 'irrigacao',
                searchQuery: 'irrigação+agrícola+OR+pivô+central+OR+gotejamento+OR+irrigação+fazenda',
                quota: 1
            }
        ]
    },
    {
        id: 'graos',
        title: 'Grãos (Café, Milho e Soja)',
        // Subcategories with quotas: 1 café + 1 milho + 1 soja
        subcategories: [
            {
                subId: 'cafe',
                searchQuery: 'café+arábica+OR+café+preço+OR+café+exportação+OR+cafeicultura',
                quota: 1
            },
            {
                subId: 'milho',
                searchQuery: 'milho+preço+OR+milho+safra+OR+milho+exportação+OR+milho+produção',
                quota: 1
            },
            {
                subId: 'soja',
                searchQuery: 'soja+preço+OR+soja+safra+OR+soja+exportação+OR+soja+produção',
                quota: 1
            }
        ]
    },
    {
        id: 'gado-corte',
        title: 'Gado de Corte',
        searchQuery: '"gado+de+corte"+OR+arroba+boi'
    },
    {
        id: 'leite',
        title: 'Leite',
        searchQuery: '"pecuária+leiteira"+OR+leite+preço'
    }
];

/**
 * Generate Google News RSS URL with dynamic period
 */
function buildFeedUrl(searchQuery, days) {
    return `https://news.google.com/rss/search?q=${searchQuery}+when:${days}d&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
}

// News sources for footer display
export const NEWS_SOURCES = {
    'Google News': 'https://news.google.com/'
};

/**
 * Get today's date in Brazil timezone (YYYY-MM-DD format)
 */
function getTodayBrazil() {
    const now = new Date();
    const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' };
    const parts = now.toLocaleDateString('pt-BR', options).split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Parse publication date to YYYY-MM-DD format
 */
function parseDate(dateStr) {
    if (!dateStr) return getTodayBrazil();
    try {
        const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }

        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        return getTodayBrazil();
    } catch {
        return getTodayBrazil();
    }
}

/**
 * Normalize a title for comparison
 */
function normalizeTitle(title) {
    if (!title) return '';
    const stopwords = ['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'uma', 'um', 'o', 'a', 'os', 'as', 'e', 'é', 'são', 'que', 'se', 'ba', 'sp', 'rj', 'mg', 'pr', 'rs', 'sc'];
    return title
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[-]/g, ' ')  // Separate hyphenated words (Fafen-BA -> fafen ba)
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopwords.includes(word))
        .sort()
        .join(' ');
}

/**
 * Basic stemming - reduce words to their root form for better matching
 * Examples: retomada -> retom, acordo -> acord, producao -> produc
 */
function basicStem(word) {
    if (!word || word.length < 4) return word;
    // Remove common Portuguese suffixes
    return word
        .replace(/(amento|imentos|mento|mentos)$/i, '')
        .replace(/(acao|acoes|icao|icoes)$/i, '')
        .replace(/(idade|idades)$/i, '')
        .replace(/(mente)$/i, '')
        .replace(/(avel|ivel|veis)$/i, '')
        .replace(/(ante|ente|inte)$/i, '')
        .replace(/(ado|ados|ada|adas|ido|idos|ida|idas)$/i, '')
        .replace(/(ar|er|ir)$/i, '')
        .replace(/(s)$/i, '');
}

/**
 * Check if a title is similar to any existing titles
 * Improved algorithm with basic stemming to catch same news from different sources
 */
function isSimilarToExisting(newTitle, existingTitles) {
    const normalizedNew = normalizeTitle(newTitle);
    const newWords = normalizedNew.split(' ').filter(w => w.length > 3);
    const newStems = new Set(newWords.map(w => basicStem(w)));

    if (newStems.size < 2) return false;

    // High-value keywords that strongly indicate same story (using stems)
    const importantStems = [
        // Acidentes/Incidentes
        'incendi', 'fog', 'acident', 'colis', 'capot', 'tombament',
        'carret', 'caminh', 'veicul', 'rodovi',
        // Crimes
        'roub', 'furt', 'apreens', 'operac', 'pris',
        // Negócios
        'leil', 'contrat', 'acord', 'fus', 'aquisi', 'retom', 'viabil', 'produc', 'fornec',
        // Empresas/Entidades (contexto agrícola) - these are VERY strong indicators
        'fafen', 'petrobr', 'embrapa', 'conab', 'bahiag'
    ];

    // Entity names that almost certainly indicate same story
    const entityStems = ['fafen', 'petrobr', 'embrapa', 'conab', 'bahiag'];

    for (const existingTitle of existingTitles) {
        const normalizedExisting = normalizeTitle(existingTitle);
        const existingWords = normalizedExisting.split(' ').filter(w => w.length > 3);
        const existingStems = new Set(existingWords.map(w => basicStem(w)));

        if (existingStems.size < 2) continue;

        let matches = 0;
        let importantMatches = 0;

        for (const stem of newStems) {
            if (existingStems.has(stem)) {
                matches++;
                if (importantStems.some(imp => stem.startsWith(imp) || imp.startsWith(stem))) {
                    importantMatches++;
                }
            }
        }

        const minSize = Math.min(newStems.size, existingStems.size);
        const similarity = matches / minSize;

        // Check if any entity stem matches (very strong indicator of same story)
        let entityMatch = false;
        for (const stem of newStems) {
            if (entityStems.some(e => stem.startsWith(e) || e.startsWith(stem))) {
                for (const existingStem of existingStems) {
                    if (entityStems.some(e => existingStem.startsWith(e) || e.startsWith(existingStem))) {
                        if (stem === existingStem || stem.startsWith(existingStem) || existingStem.startsWith(stem)) {
                            entityMatch = true;
                            break;
                        }
                    }
                }
            }
            if (entityMatch) break;
        }

        // Duplicate detection:
        // - 30% similarity with 2+ matches OR
        // - 2+ important stem matches OR
        // - Entity match (fafen, petrobras, etc.) with at least 1 other important match
        if ((similarity > 0.30 && matches >= 2) || importantMatches >= 2 || (entityMatch && importantMatches >= 1)) {
            console.log(`        🔗 Duplicate detected: "${newTitle.substring(0, 40)}..." ~ "${existingTitle.substring(0, 40)}..."`);
            return true;
        }
    }
    return false;
}

/**
 * Check if article is opinion/column
 */
function isOpinionArticle(url, sourceName, title) {
    if (url && typeof url === 'string') {
        const lowerUrl = url.toLowerCase();
        const urlPatterns = [
            '/opiniao/', '/opinion/', '/artigo/', '/coluna/', '/colunas/',
            '/column/', '/columns/', '/blog/', '/blogs/', '-opina-',
            '/editorial/', '/ponto-de-vista/', '/analise-', 'um-cafe-para-dividir', '/paladar/'
        ];
        if (urlPatterns.some(pattern => lowerUrl.includes(pattern))) {
            return true;
        }
    }

    if (sourceName && title) {
        const lowerSource = sourceName.toLowerCase();
        const lowerTitle = title.toLowerCase();

        if (lowerSource.includes('estadão') || lowerSource.includes('estadao')) {
            const opinionTitlePatterns = ['vencedor de', 'melhor de', 'pior de', 'top 10', 'melhores de'];
            if (opinionTitlePatterns.some(pattern => lowerTitle.includes(pattern))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if article is relevant for the category
 * 1. Must NOT contain GLOBAL excluded terms (lottery, entertainment, etc.)
 * 2. Must NOT contain category-specific excluded terms (blacklist)
 * 3. Must NOT have foreign country focus (geographic filter)
 * 4. If category has required keywords, MUST contain at least one (positive validation)
 * 5. MUST contain at least one agricultural context keyword (prevents false positives)
 * 6. MUST have Brazilian context (either from known source or content mentions Brazil)
 */
function isRelevantForCategory(title, summary, categoryId, sourceName = null, articleUrl = null) {
    const textToCheck = `${title || ''} ${summary || ''}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents for comparison

    // Check GLOBAL exclusions first (lottery, entertainment, etc.)
    // Use whole word matching to avoid false positives like 'quina' in 'máquina'
    for (const term of GLOBAL_EXCLUSIONS) {
        const normalizedTerm = term.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (containsWholeWord(textToCheck, normalizedTerm)) {
            console.log(`        🚫 Global exclusion hit: "${term}"`);
            return false;
        }
    }

    // Check category-specific exclusions (blacklist)
    // Also use whole word matching for consistency
    const exclusions = CATEGORY_EXCLUSIONS[categoryId];
    if (exclusions && exclusions.length > 0) {
        for (const term of exclusions) {
            const normalizedTerm = term.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (containsWholeWord(textToCheck, normalizedTerm)) {
                console.log(`        🚫 Category exclusion hit: "${term}"`);
                return false;
            }
        }
    }

    // NEW: Check for foreign country focus (geographic filter)
    // Now also checking URL and source name for foreign domains
    // Skip this check for known Brazilian sources
    if (!isFromBrazilianSource(sourceName)) {
        if (hasForeignCountryFocus(title, summary, articleUrl, sourceName)) {
            console.log(`        🚫 Foreign country focus - not relevant for Brazilian agribusiness`);
            return false;
        }
    }

    // Check required keywords (positive validation)
    const requiredKeywords = CATEGORY_REQUIRED_KEYWORDS[categoryId];
    if (requiredKeywords && requiredKeywords.length > 0) {
        let hasRequiredKeyword = false;
        for (const term of requiredKeywords) {
            const normalizedTerm = term.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (textToCheck.includes(normalizedTerm)) {
                hasRequiredKeyword = true;
                break;
            }
        }
        if (!hasRequiredKeyword) {
            return false;
        }
    }

    // Check for agricultural context (prevents false positives like "Paulinha Leite")
    let hasAgriculturalContext = false;
    for (const term of AGRICULTURAL_CONTEXT_KEYWORDS) {
        const normalizedTerm = term.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (textToCheck.includes(normalizedTerm)) {
            hasAgriculturalContext = true;
            break;
        }
    }
    if (!hasAgriculturalContext) {
        console.log(`        🚫 No agricultural context found`);
        return false;
    }

    // NEW: Verify Brazilian context (for non-Brazilian sources)
    if (!hasBrazilianContext(title, summary, sourceName)) {
        console.log(`        🚫 No Brazilian context found`);
        return false;
    }

    return true;
}

/**
 * Validate if URL is a valid article image
 */
function isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (!url.startsWith('http')) return false;

    const lowUrl = url.toLowerCase();
    const badPatterns = ['logo', 'favicon', 'icon', 'avatar', 'banner', 'ads', 'pixel', 'tracking', 'share', 'social', 'sprite', '1x1', 'blank', 'spacer'];
    if (badPatterns.some(p => lowUrl.includes(p))) return false;

    const goodPatterns = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '/image', '/img', '/foto', '/photo', 'cdn', 'media', 's3.', 'amazonaws', 'cloudfront', 'upload'];
    return goodPatterns.some(p => lowUrl.includes(p));
}

/**
 * Verify if image URL is actually accessible (not blocked by hotlinking protection)
 * Returns true if image is accessible, false otherwise
 */
async function verifyImageAccessible(imageUrl) {
    if (!imageUrl) return false;

    try {
        const https = require('https');
        const http = require('http');
        const url = new URL(imageUrl);
        const protocol = url.protocol === 'https:' ? https : http;

        return new Promise((resolve) => {
            const req = protocol.request(imageUrl, {
                method: 'HEAD',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Referer': url.origin
                }
            }, (res) => {
                // Check if response is OK and content-type is image
                const contentType = res.headers['content-type'] || '';
                const isImage = contentType.startsWith('image/');
                const isAccessible = res.statusCode >= 200 && res.statusCode < 400;
                resolve(isAccessible && isImage);
            });

            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    } catch {
        return false;
    }
}

/**
 * Navigate to Google News URL and follow redirect to get real article URL, image, and publication date
 * WITH rate limiting protection
 */
async function fetchArticleData(browser, googleNewsUrl, itemTitle) {
    let page;
    try {
        page = await browser.newPage();

        // Set random user agent
        await page.setUserAgent(getRandomUserAgent());

        // Set extra headers to appear more like a real browser
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Cache-Control': 'no-cache'
        });

        // Set viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Disable images and CSS to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`      → Fetching: ${itemTitle.substring(0, 50)}...`);

        // Navigate with longer timeout
        await page.goto(googleNewsUrl, {
            waitUntil: 'networkidle2',
            timeout: 45000
        });

        // Small random delay to appear human
        await randomDelay(500, 1500);

        // Get the final URL after redirect
        const finalUrl = page.url();
        console.log(`        ↳ Redirected to: ${finalUrl.substring(0, 60)}...`);

        // Check if the page is a 404 error page
        const is404Page = await page.evaluate(() => {
            const pageTitle = document.title.toLowerCase();
            const bodyText = document.body?.innerText?.toLowerCase() || '';

            // Common 404 indicators in title
            const titleIndicators = ['404', 'não encontrada', 'not found', 'página não existe', 'erro'];
            const titleIs404 = titleIndicators.some(ind => pageTitle.includes(ind));

            // Common 404 indicators in body (check first 2000 chars to catch messages further down)
            const bodyStart = bodyText.substring(0, 2000);
            const bodyIndicators = ['página não encontrada', 'page not found', 'conteúdo não existe',
                'link acessado não existe', 'o conteúdo solicitado não foi encontrado',
                'conteúdo solicitado não foi encontrado', 'esta página não existe',
                'artigo não encontrado', 'notícia não encontrada', 'erro 404'];
            const bodyIs404 = bodyIndicators.some(ind => bodyStart.includes(ind));

            return titleIs404 || bodyIs404;
        });

        if (is404Page) {
            console.log(`        ✗ 404 Page detected, skipping article`);
            await page.close();
            return { finalUrl: null, imageUrl: null, pubDate: null, summary: null, is404: true };
        }

        // Extract og:image, publication date, and summary from the final page
        const { imageUrl, pubDate, summary } = await page.evaluate(() => {
            let extractedImage = null;

            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage?.content) extractedImage = ogImage.content;

            if (!extractedImage) {
                const twitterImage = document.querySelector('meta[name="twitter:image"]');
                if (twitterImage?.content) extractedImage = twitterImage.content;
            }

            if (!extractedImage) {
                const containers = ['article', 'main', '.content', '.post', '.materia', '.article-content', '.entry-content'];
                for (const selector of containers) {
                    const container = document.querySelector(selector);
                    if (container) {
                        const img = container.querySelector('img[src*="http"]');
                        if (img?.src) {
                            extractedImage = img.src;
                            break;
                        }
                    }
                }
            }

            let extractedDate = null;

            const publishedTime = document.querySelector('meta[property="article:published_time"]');
            if (publishedTime?.content) extractedDate = publishedTime.content;

            if (!extractedDate) {
                const jsonLd = document.querySelector('script[type="application/ld+json"]');
                if (jsonLd) {
                    try {
                        const data = JSON.parse(jsonLd.textContent);
                        if (data.datePublished) extractedDate = data.datePublished;
                        if (!extractedDate && data['@graph']) {
                            for (const item of data['@graph']) {
                                if (item.datePublished) {
                                    extractedDate = item.datePublished;
                                    break;
                                }
                            }
                        }
                    } catch (e) { }
                }
            }

            if (!extractedDate) {
                const ogPublished = document.querySelector('meta[property="og:published_time"]');
                if (ogPublished?.content) extractedDate = ogPublished.content;
            }

            if (!extractedDate) {
                const timeEl = document.querySelector('time[datetime]');
                if (timeEl?.getAttribute('datetime')) extractedDate = timeEl.getAttribute('datetime');
            }

            let extractedSummary = null;

            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc?.content) extractedSummary = ogDesc.content;

            if (!extractedSummary) {
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc?.content) extractedSummary = metaDesc.content;
            }

            if (!extractedSummary) {
                const twitterDesc = document.querySelector('meta[name="twitter:description"]');
                if (twitterDesc?.content) extractedSummary = twitterDesc.content;
            }

            if (!extractedSummary) {
                const jsonLd = document.querySelector('script[type="application/ld+json"]');
                if (jsonLd) {
                    try {
                        const data = JSON.parse(jsonLd.textContent);
                        if (data.description) extractedSummary = data.description;
                        if (!extractedSummary && data['@graph']) {
                            for (const item of data['@graph']) {
                                if (item.description) {
                                    extractedSummary = item.description;
                                    break;
                                }
                            }
                        }
                    } catch (e) { }
                }
            }

            if (!extractedSummary) {
                const containers = ['article', 'main', '.content', '.post', '.materia', '.article-content', '.entry-content'];
                for (const selector of containers) {
                    const container = document.querySelector(selector);
                    if (container) {
                        const paragraph = container.querySelector('p');
                        if (paragraph?.textContent && paragraph.textContent.length > 50) {
                            extractedSummary = paragraph.textContent.trim();
                            break;
                        }
                    }
                }
            }

            return { imageUrl: extractedImage, pubDate: extractedDate, summary: extractedSummary };
        });

        await page.close();

        const isValid = imageUrl && isValidImageUrl(imageUrl);
        console.log(`        ↳ Image: ${isValid ? '✓ Found' : '✗ Not found or invalid'}`);

        return {
            finalUrl,
            imageUrl: isValid ? imageUrl : null,
            pubDate: pubDate || null,
            summary: summary || null
        };
    } catch (error) {
        console.log(`        ↳ Error: ${error.message}`);
        if (page) await page.close().catch(() => { });
        return { finalUrl: googleNewsUrl, imageUrl: null, pubDate: null, summary: null };
    }
}

/**
 * Fetch news for a single search query (subcategory or regular category)
 * WITH delays between each article to avoid rate limiting
 * @param {Object} options - Additional options
 * @param {boolean} options.requireInTitle - If true, required keywords must appear in title (not just summary)
 * @param {boolean} options.skipValidations - If true, skip regular validations (agricultural context, geographic, etc.)
 * @param {string[]} options.excludeSources - Sources to exclude (e.g., company's own websites)
 * @param {boolean} options.checkKeywordInTitleOrSummary - If true, check if keyword exists in title OR summary
 */
async function fetchNewsForQuery(browser, searchQuery, subId, categoryId, quota, existingTitles, options = {}) {
    const { requireInTitle = false, skipValidations = false, excludeSources = [], checkKeywordInTitleOrSummary = false } = options;
    console.log(`    🔍 Fetching subcategory: ${subId} (quota: ${quota})${requireInTitle ? ' [TITLE REQUIRED]' : ''}${skipValidations ? ' [SKIP VALIDATIONS]' : ''}${checkKeywordInTitleOrSummary ? ' [TITLE OR SUMMARY]' : ''}...`);
    const news = [];

    for (const days of PERIOD_SEQUENCE) {
        if (news.length >= quota) break;

        const feedUrl = buildFeedUrl(searchQuery, days);
        console.log(`      📅 Trying ${days} days period...`);

        try {
            const feed = await parser.parseURL(feedUrl);
            console.log(`      📄 Found ${feed.items.length} items in RSS feed`);

            for (const item of feed.items.slice(0, 25)) {
                if (news.length >= quota) break;

                let cleanTitle = (item.title || '').replace(/ - [^-]+$/, '').trim();

                if (isSimilarToExisting(cleanTitle, existingTitles)) {
                    console.log(`        ⏭️ Skipping duplicate: ${cleanTitle.substring(0, 50)}...`);
                    continue;
                }

                // IMPORTANT: Add delay between each article fetch to avoid rate limiting
                await randomDelay(5000, 8000);

                const fetchResult = await fetchArticleData(browser, item.link, item.title || 'Unknown');
                const { finalUrl, imageUrl, pubDate: articlePubDate, summary: articleSummary, is404 } = fetchResult;

                // Skip 404 pages
                if (is404) {
                    console.log(`        ⏭️ Skipping 404 page: ${cleanTitle.substring(0, 50)}...`);
                    continue;
                }

                let sourceName = 'Google News';
                if (item.source) {
                    sourceName = typeof item.source === 'string' ? item.source : item.source._ || item.source.title || 'Google News';
                }

                // Check excluded sources (e.g., Cooxupé's own websites)
                if (excludeSources.length > 0) {
                    const lowerUrl = (finalUrl || '').toLowerCase();
                    const lowerSource = (sourceName || '').toLowerCase();
                    const isExcluded = excludeSources.some(excluded => {
                        const lowerExcluded = excluded.toLowerCase();
                        return lowerUrl.includes(lowerExcluded) || lowerSource.includes(lowerExcluded);
                    });
                    if (isExcluded) {
                        console.log(`        ⏭️ Skipping excluded source: ${sourceName}`);
                        continue;
                    }
                }

                // Check GLOBAL excluded aggregator sources (e.g., MSN republishes with wrong dates)
                const lowerUrlForAggregator = (finalUrl || '').toLowerCase();
                const isExcludedAggregator = EXCLUDED_AGGREGATOR_SOURCES.some(aggregator =>
                    lowerUrlForAggregator.includes(aggregator.toLowerCase())
                );
                if (isExcludedAggregator) {
                    console.log(`        ⏭️ Skipping aggregator source (wrong dates): ${finalUrl.substring(0, 50)}...`);
                    continue;
                }

                // Skip regular validations if skipValidations is true (e.g., for Cooxupé category)
                if (!skipValidations) {
                    if (isOpinionArticle(finalUrl, sourceName, cleanTitle)) {
                        console.log(`        ⏭️ Skipping opinion/column: ${cleanTitle.substring(0, 50)}...`);
                        continue;
                    }

                    // Check if article is relevant for this subcategory (includes geographic filter + domain check)
                    if (!isRelevantForCategory(cleanTitle, articleSummary, subId, sourceName, finalUrl)) {
                        console.log(`        ⏭️ Skipping irrelevant: ${cleanTitle.substring(0, 50)}...`);
                        continue;
                    }
                }

                // Special validation: if requireInTitle is true, check if required keywords appear in title
                if (requireInTitle) {
                    const requiredKeywords = CATEGORY_REQUIRED_KEYWORDS[subId];
                    if (requiredKeywords && requiredKeywords.length > 0) {
                        const normalizedTitle = cleanTitle.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const hasKeywordInTitle = requiredKeywords.some(keyword => {
                            const normalizedKeyword = keyword.toLowerCase()
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                            return normalizedTitle.includes(normalizedKeyword);
                        });
                        if (!hasKeywordInTitle) {
                            console.log(`        ⏭️ Skipping (not in title): ${cleanTitle.substring(0, 50)}...`);
                            continue;
                        }
                        console.log(`        ✨ Keyword found in title!`);
                    }
                }

                // Check if keyword exists in title OR summary (for categories like Cooxupé)
                if (checkKeywordInTitleOrSummary) {
                    const requiredKeywords = CATEGORY_REQUIRED_KEYWORDS[subId];
                    if (requiredKeywords && requiredKeywords.length > 0) {
                        const normalizedTitle = cleanTitle.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const normalizedSummary = (articleSummary || '').toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const textToSearch = `${normalizedTitle} ${normalizedSummary}`;

                        const hasKeyword = requiredKeywords.some(keyword => {
                            const normalizedKeyword = keyword.toLowerCase()
                                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                            return textToSearch.includes(normalizedKeyword);
                        });
                        if (!hasKeyword) {
                            console.log(`        ⏭️ Skipping (not in title/summary): ${cleanTitle.substring(0, 50)}...`);
                            continue;
                        }
                        console.log(`        ✨ Keyword found in title or summary!`);
                    }
                }

                if (!imageUrl) {
                    continue;
                }

                existingTitles.push(cleanTitle);

                // PRIORIDADE: RSS feed date (Google News) > HTML extracted date > Today
                // O Google News já extrai e normaliza a data de publicação, então é mais confiável
                const rssFeedDate = item.pubDate || item.isoDate;
                const rawDate = rssFeedDate || articlePubDate;
                const finalPubDate = parseDate(rawDate);
                console.log(`        ↳ Date: RSS="${rssFeedDate || 'N/A'}" HTML="${articlePubDate || 'N/A'}" → parsed="${finalPubDate}"`);

                // Validar idade da notícia - no máximo 30 dias
                if (finalPubDate) {
                    const pubDateObj = new Date(finalPubDate.split('/').reverse().join('-'));
                    const now = new Date();
                    const daysDiff = Math.floor((now - pubDateObj) / (1000 * 60 * 60 * 24));
                    if (daysDiff > 30) {
                        console.log(`        ✗ Skipped: News is ${daysDiff} days old (max 30)`);
                        continue;
                    }
                }

                let finalSummary = articleSummary;
                // Ensure finalSummary is a string before processing
                if (finalSummary && typeof finalSummary === 'string') {
                    finalSummary = finalSummary.replace(/<[^>]*>/g, '').trim().substring(0, 250);
                } else {
                    finalSummary = null;
                }
                if (!finalSummary || finalSummary === cleanTitle) {
                    finalSummary = cleanTitle.substring(0, 250);
                }
                console.log(`        ↳ Summary: ${finalSummary ? '✓ Found' : '✗ Using title'}`);

                news.push({
                    id: `${categoryId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                    title: cleanTitle.substring(0, 150),
                    summary: finalSummary,
                    imageUrl,
                    articleUrl: finalUrl,
                    categoryId: categoryId,
                    subcategory: subId,
                    source: sourceName,
                    pubDate: finalPubDate
                });
            }

            console.log(`      📊 Current: ${news.length}/${quota} news with images`);

            if (news.length >= quota) {
                console.log(`      ✅ Got ${news.length} items with ${days} days period`);
                break;
            } else if (days < PERIOD_SEQUENCE[PERIOD_SEQUENCE.length - 1]) {
                console.log(`      ⏩ Expanding search period...`);
            }
        } catch (error) {
            console.error(`      ❌ Error with ${days} days period:`, error.message);
        }
    }

    if (news.length < quota) {
        console.log(`      ⚠️ Only found ${news.length} items after trying all periods`);
    }

    return news;
}

/**
 * Fetch news for a single category from Google News RSS with progressive period
 * Supports both regular categories and categories with subcategories/quotas
 */
async function fetchCategoryNews(browser, category) {
    console.log(`  📰 Fetching ${category.title}...`);
    const existingTitles = [];

    // Check if category has subcategories with quotas
    if (category.subcategories && category.subcategories.length > 0) {
        const allNews = [];

        for (const sub of category.subcategories) {
            // Add delay between subcategories
            if (allNews.length > 0) {
                console.log(`    ⏳ Waiting before next subcategory...`);
                await randomDelay(5000, 8000);
            }

            const subNews = await fetchNewsForQuery(
                browser,
                sub.searchQuery,
                sub.subId,
                category.id,
                sub.quota,
                existingTitles
            );
            allNews.push(...subNews);
        }

        console.log(`  ✅ Total for ${category.title}: ${allNews.length} news`);
        return allNews;
    }

    // Regular category without subcategories
    const REQUIRED_NEWS = category.newsQuota || 3;
    const allNews = await fetchNewsForQuery(
        browser,
        category.searchQuery,
        category.id,
        category.id,
        REQUIRED_NEWS,
        existingTitles,
        {
            requireInTitle: category.requireInTitle || false,
            skipValidations: category.skipValidations || false,
            excludeSources: category.excludeSources || [],
            checkKeywordInTitleOrSummary: category.checkKeywordInTitleOrSummary || false
        }
    );

    return allNews;
}

/**
 * Main function to collect news from all categories
 * WITH delays between each category to avoid rate limiting
 */
export async function collectNews() {
    console.log('\n📰 Starting Google News RSS collection...');
    console.log(`━━━ Date: ${getTodayBrazil()} ━━━`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080'
            ]
        });
        console.log('  ✅ Browser launched');
    } catch (error) {
        console.error('❌ Failed to launch browser:', error.message);
        return { lastUpdate: new Date().toISOString(), categories: [], sources: NEWS_SOURCES };
    }

    const categories = [];

    try {
        // Fetch news for each category WITH delays between categories
        for (let i = 0; i < CATEGORY_FEEDS.length; i++) {
            const categoryConfig = CATEGORY_FEEDS[i];

            const news = await fetchCategoryNews(browser, categoryConfig);

            categories.push({
                id: categoryConfig.id,
                title: categoryConfig.title,
                news
            });

            // Add delay between categories to avoid rate limiting
            if (i < CATEGORY_FEEDS.length - 1) {
                console.log(`    ⏳ Waiting before next category...`);
                await randomDelay(10000, 15000);
            }
        }
    } finally {
        await browser.close();
        console.log('  ✅ Browser closed');
    }

    console.log('\n━━━ Collection Summary ━━━');
    let totalItems = 0;
    for (const cat of categories) {
        console.log(`  📁 ${cat.title}: ${cat.news.length} news`);
        totalItems += cat.news.length;
    }
    console.log(`  📊 Total: ${totalItems} items`);

    return {
        lastUpdate: new Date().toISOString(),
        categories,
        sources: NEWS_SOURCES
    };
}

// ═══════════════════════════════════════════════════════════════════
// INCREMENTAL COLLECTION API - For pause/resume between categories
// ═══════════════════════════════════════════════════════════════════

/**
 * Get list of category configurations
 */
export function getCategoryConfigs() {
    return CATEGORY_FEEDS.map(cat => ({
        id: cat.id,
        title: cat.title
    }));
}

/**
 * Get total number of categories
 */
export function getCategoryCount() {
    return CATEGORY_FEEDS.length;
}

/**
 * Launch browser for news collection
 */
export async function launchNewsBrowser() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });
    return browser;
}

/**
 * Close browser
 */
export async function closeNewsBrowser(browser) {
    if (browser) {
        await browser.close();
    }
}

/**
 * Collect a single category by index
 * Returns { id, title, news } for the category
 */
export async function collectSingleCategory(browser, categoryIndex) {
    if (categoryIndex < 0 || categoryIndex >= CATEGORY_FEEDS.length) {
        throw new Error(`Invalid category index: ${categoryIndex}`);
    }

    const categoryConfig = CATEGORY_FEEDS[categoryIndex];
    console.log(`  📰 Fetching ${categoryConfig.title}...`);

    const news = await fetchCategoryNews(browser, categoryConfig);

    return {
        id: categoryConfig.id,
        title: categoryConfig.title,
        news
    };
}

/**
 * Build final news data object from collected categories
 */
export function buildNewsData(categories) {
    console.log('\n━━━ Collection Summary ━━━');
    let totalItems = 0;
    for (const cat of categories) {
        console.log(`  📁 ${cat.title}: ${cat.news.length} news`);
        totalItems += cat.news.length;
    }
    console.log(`  📊 Total: ${totalItems} items`);

    return {
        lastUpdate: new Date().toISOString(),
        categories,
        sources: NEWS_SOURCES
    };
}
