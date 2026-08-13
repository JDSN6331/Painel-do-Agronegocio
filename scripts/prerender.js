import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('❌ dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

function getArticlesData() {
  const filePath = path.join(rootDir, 'src', 'data', 'articlesData.ts');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(/export const ARTICLES_DATA: Article\[\] = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not parse ARTICLES_DATA');
  return Function(`"use strict"; return (${match[1]});`)();
}

const articles = getArticlesData();

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildHtmlPage({ title, description, canonicalUrl, ogType = 'website', jsonLd, bodyHtml }) {
  let html = baseTemplate;

  // Replace Title
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  }

  // Replace Description
  if (description) {
    html = html.replace(/<meta name="description"\s+content="[\s\S]*?" \/>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/i, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  }

  // Replace Canonical URL
  if (canonicalUrl) {
    html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  }

  // Replace og:type
  if (ogType) {
    html = html.replace(/<meta property="og:type" content="[\s\S]*?" \/>/i, `<meta property="og:type" content="${ogType}" />`);
  }

  // Inject or replace JSON-LD
  if (jsonLd) {
    const jsonLdScript = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLdScript);
  }

  // Inject pre-rendered body content into #root
  if (bodyHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
  }

  return html;
}

function generateHeaderHtml() {
  return `
    <header class="fixed top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0">
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex items-center gap-4">
            <img src="/Logo.png" alt="Logo Painel do Agronegócio" class="w-16 h-16 md:w-20 md:h-20 object-contain" />
            <div class="flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
              <h1 class="text-2xl md:text-3xl font-bold font-heading text-gold-gradient">
                <a href="/">Painel do Agronegócio</a>
              </h1>
              <p class="text-sm text-muted-foreground max-w-[320px] md:max-w-[400px]">
                Plataforma com dados atualizados do agronegócio brasileiro: cotações, clima e notícias em tempo real.
              </p>
            </div>
          </div>
          <nav class="flex flex-wrap xl:flex-nowrap items-center justify-center lg:justify-end gap-1 sm:gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground py-1">
            <a href="/" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Início</a>
            <a href="/artigos" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Artigos</a>
            <a href="/calculadoras" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Calculadoras</a>
            <a href="/sobre" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Sobre</a>
            <a href="/contato" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Contato</a>
            <a href="/privacidade" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Privacidade</a>
            <a href="/termos" class="px-2 py-1 rounded-md transition-colors hover:text-agro-gold">Termos</a>
          </nav>
        </div>
      </div>
    </header>
  `;
}

function generateFooterHtml() {
  return `
    <footer class="glass-panel rounded-none border-x-0 border-b-0 py-8 mt-auto">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          <div class="space-y-3">
            <h3 class="text-base font-bold font-heading text-agro-gold">Painel do Agronegócio</h3>
            <p class="text-xs text-muted-foreground leading-relaxed">
              Plataforma de inteligência e informação para o agronegócio brasileiro: cotações em tempo real, meteorologia, ferramentas agrícolas e artigos orientativos.
            </p>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Navegação</h4>
            <ul class="space-y-2 text-xs text-muted-foreground">
              <li><a href="/" class="hover:text-agro-gold">Início</a></li>
              <li><a href="/artigos" class="hover:text-agro-gold">Artigos & Análises</a></li>
              <li><a href="/calculadoras" class="hover:text-agro-gold">Calculadoras Agrícolas</a></li>
              <li><a href="https://crc-comercial-insumos-guia-agronomico.br1rfu.easypanel.host/" target="_blank" rel="noopener noreferrer" class="hover:text-agro-gold text-agro-gold font-medium">Guia Agronômico AgroBase ↗</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Institucional</h4>
            <ul class="space-y-2 text-xs text-muted-foreground">
              <li><a href="/sobre" class="hover:text-agro-gold">Sobre Nós</a></li>
              <li><a href="/contato" class="hover:text-agro-gold">Contato</a></li>
              <li><a href="/privacidade" class="hover:text-agro-gold">Política de Privacidade</a></li>
              <li><a href="/termos" class="hover:text-agro-gold">Termos de Uso</a></li>
            </ul>
          </div>
          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-foreground uppercase tracking-wider">Transparência</h4>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              As cotações e dados meteorológicos são obtidos de fontes públicas e APIs abertas. As notícias externas são agregadas via RSS e pertencem aos seus respectivos veículos.
            </p>
          </div>
        </div>
        <hr class="border-muted-foreground/20 my-6" />
        <div class="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
          <p>© 2026 Painel do Agronegócio. Todos os direitos reservados.</p>
          <p>Redação • Painel do Agronegócio</p>
        </div>
      </div>
    </footer>
  `;
}

console.log('🚀 Starting SSG Pre-rendering for Google Indexing & AdSense...');

// 1. HOMEPAGE PRERENDER
const homepageArticlesCardsHtml = articles.map(article => `
  <article class="glass-card rounded-xl overflow-hidden flex flex-col h-full">
    <div class="p-4 flex flex-col flex-1">
      <span class="text-[11px] text-agro-gold font-medium mb-1">${escapeHtml(article.categoryName)}</span>
      <h3 class="text-base font-bold font-heading text-foreground mb-2">
        <a href="/artigos/${article.slug}" class="hover:underline">${escapeHtml(article.title)}</a>
      </h3>
      <p class="text-xs text-muted-foreground mb-4">${escapeHtml(article.excerpt)}</p>
      <div class="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
        <span>${escapeHtml(article.readTime)}</span>
        <a href="/artigos/${article.slug}" class="text-agro-gold font-semibold hover:underline">Ler artigo completo →</a>
      </div>
    </div>
  </article>
`).join('');

const homeBodyHtml = `
  <div class="min-h-screen flex flex-col">
    ${generateHeaderHtml()}
    <main class="container mx-auto px-4 pt-40 pb-12 flex-grow">
      <section class="mb-8">
        <h2 class="text-xl md:text-2xl font-bold font-heading text-gold-gradient mb-2">Plataforma de Inteligência do Agronegócio Brasileiro</h2>
        <p class="text-sm text-muted-foreground">Cotações em tempo real de soja, milho, boi gordo, café e mais commodities. Meteorologia agrícola e calculadoras operacionais para a tomada de decisão no campo.</p>
      </section>

      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl md:text-2xl font-bold font-heading text-gold-gradient">Artigos & Análises do Agronegócio (${articles.length} Artigos Autorais)</h2>
          <a href="/artigos" class="btn-gold text-xs px-4 py-2">Ver todos os artigos →</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${homepageArticlesCardsHtml}
        </div>
      </section>

      <section class="mb-12">
        <div class="glass-card rounded-2xl p-6 border border-agro-gold/30 bg-gradient-to-r from-background/90 via-agro-gold/5 to-background/90">
          <h2 class="text-xl font-bold text-gold-gradient mb-2">Guia Agronômico AgroBase</h2>
          <p class="text-sm text-muted-foreground mb-4">Acesse um guia completo de insumos, manejo e recomendações técnicas para apoiar o planejamento e as melhores decisões no campo.</p>
          <a href="https://crc-comercial-insumos-guia-agronomico.br1rfu.easypanel.host/" target="_blank" rel="noopener noreferrer" class="btn-gold px-5 py-2.5 text-xs font-semibold rounded-xl inline-block">Acessar Guia Agronômico AgroBase ↗</a>
        </div>
      </section>
    </main>
    ${generateFooterHtml()}
  </div>
`;

const homepageHtml = buildHtmlPage({
  title: 'Painel do Agronegócio | Artigos Autorais, Cotações e Calculadoras Agrícolas',
  description: 'Portal completo com artigos autorais sobre o agronegócio brasileiro, cotações de commodities em tempo real, calculadoras agrícolas e dados meteorológicos.',
  canonicalUrl: 'https://painelagrofocus.com/',
  bodyHtml: homeBodyHtml
});
fs.writeFileSync(path.join(distDir, 'index.html'), homepageHtml, 'utf-8');
console.log('  ✅ Pre-rendered homepage: /index.html');

// 2. ARTIGOS LISTING PAGE PRERENDER
const artigosListDir = path.join(distDir, 'artigos');
ensureDir(artigosListDir);

const artigosCardsFullHtml = articles.map(article => `
  <article class="glass-card rounded-xl p-5 flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span class="px-2 py-0.5 rounded bg-agro-gold/10 text-agro-gold border border-agro-gold/30 font-medium">${escapeHtml(article.categoryName)}</span>
        <span>${escapeHtml(article.readTime)} • ${escapeHtml(article.publishedAt)}</span>
      </div>
      <h2 class="text-lg font-bold font-heading text-foreground mb-2">
        <a href="/artigos/${article.slug}" class="hover:text-agro-gold transition-colors">${escapeHtml(article.title)}</a>
      </h2>
      <p class="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">${escapeHtml(article.excerpt)}</p>
    </div>
    <a href="/artigos/${article.slug}" class="text-xs font-semibold text-agro-gold hover:underline inline-flex items-center gap-1">
      Ler artigo completo (${article.readTime}) →
    </a>
  </article>
`).join('');

const artigosPageBodyHtml = `
  <div class="min-h-screen flex flex-col">
    ${generateHeaderHtml()}
    <main class="container mx-auto px-4 pt-40 pb-12 flex-grow">
      <header class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold font-heading text-gold-gradient mb-2">Artigos & Análises Técnicas do Agronegócio</h1>
        <p class="text-sm text-muted-foreground max-w-3xl">Conteúdo autoral e orientativo sobre gestão de custos na safra, fertilizantes, manejo de solo, irrigação, máquinas agrícolas, pecuária e tecnologia no campo.</p>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${artigosCardsFullHtml}
      </div>
    </main>
    ${generateFooterHtml()}
  </div>
`;

const artigosListingHtml = buildHtmlPage({
  title: 'Artigos & Análises Técnicas do Agronegócio | Painel do Agronegócio',
  description: 'Confira artigos exclusivos sobre gestão agrícola, tecnologia no campo, pecuária de corte e leite, cafeicultura, grãos e fertilizantes.',
  canonicalUrl: 'https://painelagrofocus.com/artigos',
  bodyHtml: artigosPageBodyHtml
});
fs.writeFileSync(path.join(artigosListDir, 'index.html'), artigosListingHtml, 'utf-8');
console.log('  ✅ Pre-rendered articles listing: /artigos/index.html');

// 3. INDIVIDUAL ARTICLE PAGES PRERENDER (All 18 articles)
articles.forEach(article => {
  const articleDir = path.join(artigosListDir, article.slug);
  ensureDir(articleDir);

  const paragraphsHtml = article.content.map(p => `<p class="mb-4 text-sm text-muted-foreground leading-relaxed">${escapeHtml(p)}</p>`).join('\n');

  const articleBodyHtml = `
    <div class="min-h-screen flex flex-col">
      ${generateHeaderHtml()}
      <main class="container mx-auto px-4 pt-40 pb-12 flex-grow max-w-4xl">
        <nav class="text-xs text-muted-foreground mb-6">
          <a href="/" class="hover:underline">Início</a> &gt; <a href="/artigos" class="hover:underline">Artigos</a> &gt; <span class="text-agro-gold">${escapeHtml(article.categoryName)}</span>
        </nav>
        <article class="glass-panel p-6 md:p-10 rounded-2xl space-y-6">
          <header class="space-y-3 border-b border-agro-gold/20 pb-6">
            <span class="px-3 py-1 bg-agro-gold/10 text-agro-gold border border-agro-gold/30 text-xs font-semibold rounded-full">${escapeHtml(article.categoryName)}</span>
            <h1 class="text-2xl md:text-4xl font-bold font-heading text-gold-gradient leading-tight">${escapeHtml(article.title)}</h1>
            <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
              <span>Por <strong>${escapeHtml(article.author)}</strong></span>
              <span>•</span>
              <span>Publicado em ${escapeHtml(article.publishedAt)}</span>
              <span>•</span>
              <span>Tempo de leitura: ${escapeHtml(article.readTime)}</span>
            </div>
          </header>
          <div class="relative rounded-xl overflow-hidden my-6">
            <img src="${article.imageUrl}" alt="${escapeHtml(article.title)}" class="w-full max-h-[400px] object-cover" />
          </div>
          <div class="prose prose-invert max-w-none text-foreground leading-relaxed space-y-4">
            ${paragraphsHtml}
          </div>
          <footer class="pt-6 border-t border-agro-gold/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="/artigos" class="btn-gold text-xs px-4 py-2">← Voltar para a lista de artigos</a>
            <a href="/" class="text-xs text-agro-gold hover:underline">Ir para a página inicial</a>
          </footer>
        </article>
      </main>
      ${generateFooterHtml()}
    </div>
  `;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'description': article.excerpt,
    'image': [`https://painelagrofocus.com${article.imageUrl}`],
    'datePublished': `${article.publishedAt}T08:00:00-03:00`,
    'dateModified': `${article.publishedAt}T08:00:00-03:00`,
    'author': [{
      '@type': 'Organization',
      'name': article.author,
      'url': 'https://painelagrofocus.com/'
    }],
    'publisher': {
      '@type': 'Organization',
      'name': 'Painel do Agronegócio',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://painelagrofocus.com/Logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://painelagrofocus.com/artigos/${article.slug}`
    }
  };

  const articleHtml = buildHtmlPage({
    title: `${article.title} | Painel do Agronegócio`,
    description: article.excerpt,
    canonicalUrl: `https://painelagrofocus.com/artigos/${article.slug}`,
    ogType: 'article',
    jsonLd: articleJsonLd,
    bodyHtml: articleBodyHtml
  });

  fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf-8');
});
console.log(`  ✅ Pre-rendered ${articles.length} individual article pages.`);

// 4. CALCULADORAS PRERENDER
const calcDir = path.join(distDir, 'calculadoras');
ensureDir(calcDir);

const calculadorasBodyHtml = `
  <div class="min-h-screen flex flex-col">
    ${generateHeaderHtml()}
    <main class="container mx-auto px-4 pt-40 pb-12 flex-grow">
      <header class="mb-8">
        <h1 class="text-2xl md:text-3xl font-bold font-heading text-gold-gradient mb-2">Calculadoras Agrícolas de Precisão</h1>
        <p class="text-sm text-muted-foreground max-w-3xl">Ferramentas operacionais para o produtor rural: estimativa de sementes por hectare, dosagem de adubação, regulagem de pulverizadores, quebra de umidade de grãos e planejamento financeiro.</p>
      </header>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">1. População de Sementes e Plantio</h2>
          <p class="text-xs text-muted-foreground">Calcule a quantidade exata de sementes por metro linear e quilos por hectare com base no espaçamento e germinação.</p>
        </div>
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">2. Adubação NPK e Correção de Solo</h2>
          <p class="text-xs text-muted-foreground">Estime a dosagem de fertilizante comercial necessária com base na recomendação agronômica do laudo de solo.</p>
        </div>
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">3. Regulagem de Pulverização</h2>
          <p class="text-xs text-muted-foreground">Determine a vazão das pontas (L/min) e a velocidade do trator para atingir o volume de calda (L/ha) desejado.</p>
        </div>
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">4. Perda de Colheita de Grãos</h2>
          <p class="text-xs text-muted-foreground">Calcule o percentual de perdas em sacas/ha através da amostragem de grãos recolhidos após a passagem da colheitadeira.</p>
        </div>
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">5. Desconto de Umidade e Impurezas</h2>
          <p class="text-xs text-muted-foreground">Simule o desconto exato de peso na entrega do produto no armazém ou cooperativa com base na umidade padrão.</p>
        </div>
        <div class="glass-card p-6 rounded-xl space-y-3">
          <h2 class="text-lg font-bold text-agro-gold">6. Ponto de Equilíbrio (Break-Even)</h2>
          <p class="text-xs text-muted-foreground">Saiba quantas sacas por hectare são necessárias para cobrir o custo operacional efetivo (COE) da lavoura.</p>
        </div>
      </div>
    </main>
    ${generateFooterHtml()}
  </div>
`;

const calculadorasHtml = buildHtmlPage({
  title: 'Calculadoras Agrícolas de Rendimento e Plantio | Painel do Agronegócio',
  description: 'Ferramentas operacionais gratuitas para cálculo de sementes, dosagem de adubo, vazão de pulverizador, quebra de umidade de grãos e ponto de equilíbrio.',
  canonicalUrl: 'https://painelagrofocus.com/calculadoras',
  bodyHtml: calculadorasBodyHtml
});
fs.writeFileSync(path.join(calcDir, 'index.html'), calculadorasHtml, 'utf-8');
console.log('  ✅ Pre-rendered calculadoras page: /calculadoras/index.html');

// 5. INSTITUTIONAL PAGES (Sobre, Contato, Privacidade, Termos)
const pagesConfig = [
  {
    slug: 'sobre',
    title: 'Sobre Nós | Painel do Agronegócio',
    description: 'Conheça a missão do Painel do Agronegócio: fornecer inteligência, cotações em tempo real, meteorologia e calculadoras para o agro brasileiro.',
    heading: 'Sobre o Painel do Agronegócio',
    content: `
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">O <strong>Painel do Agronegócio</strong> nasceu com a missão de democratizar a informação técnica e financeira para o produtor rural brasileiro, engenheiros agrônomos, zootecnistas e profissionais do setor agropecuário.</p>
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">Em um mercado dinâmico e globalizado, o acesso rápido a cotações confiáveis de commodities (soja, milho, boi gordo, café, leite), aliadas à previsão meteorológica precisa e ferramentas operacionais, representa a diferença entre o lucro e o prejuízo no campo.</p>
      <h2 class="text-lg font-bold text-agro-gold mt-6 mb-2">Nossos Pilares</h2>
      <ul class="list-disc list-inside text-sm text-muted-foreground space-y-2 mb-4">
        <li><strong>Transparência:</strong> Dados agregados de fontes oficiais e APIs abertas.</li>
        <li><strong>Conteúdo Autoral:</strong> Artigos orientativos focados na gestão de custos, microbiologia do solo e inovação.</li>
        <li><strong>Ferramental Prático:</strong> Calculadoras desenhadas para resolver dúvidas operacionais no dia a dia da fazenda.</li>
      </ul>
    `
  },
  {
    slug: 'contato',
    title: 'Contato & Redação | Painel do Agronegócio',
    description: 'Fale com a equipe do Painel do Agronegócio. Sugestões de pauta, parcerias comerciais e suporte ao leitor.',
    heading: 'Fale Conosco',
    content: `
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">Estamos sempre abertos para ouvir sugestões de pauta, dúvidas sobre nossas calculadoras ou propostas de parcerias institucionais.</p>
      <div class="glass-card p-6 rounded-xl space-y-3 max-w-xl">
        <p class="text-sm text-foreground"><strong>E-mail de Contato:</strong> contato@painelagrofocus.com</p>
        <p class="text-sm text-foreground"><strong>Redação & Editorial:</strong> redacao@painelagrofocus.com</p>
        <p class="text-sm text-muted-foreground">Atendimento de segunda a sexta-feira, das 08h às 18h.</p>
      </div>
    `
  },
  {
    slug: 'privacidade',
    title: 'Política de Privacidade | Painel do Agronegócio',
    description: 'Política de Privacidade e Proteção de Dados do Painel do Agronegócio em conformidade com a LGPD.',
    heading: 'Política de Privacidade',
    content: `
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">A sua privacidade é fundamental para o Painel do Agronegócio. Esta Política de Privacidade explica como coletamos, usamos e protegemos as informações dos usuários ao navegar em nossa plataforma, de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
      <h2 class="text-lg font-bold text-agro-gold mt-6 mb-2">1. Coleta de Dados</h2>
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">Não solicitamos cadastro prévio ou dados pessoais para navegação ou uso de nossas calculadoras agrícolas. Coletamos apenas dados anônimos de tráfego (como endereço IP e navegador) para análise de estatísticas e melhoria do desempenho do site.</p>
      <h2 class="text-lg font-bold text-agro-gold mt-6 mb-2">2. Anúncios e Cookies (Google AdSense)</h2>
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">Utilizamos parceiros de publicidade, como o Google AdSense, que podem usar cookies para veicular anúncios com base nas visitas anteriores dos usuários ao nosso ou a outros sites na internet.</p>
    `
  },
  {
    slug: 'termos',
    title: 'Termos de Uso | Painel do Agronegócio',
    description: 'Termos e Condições Gerais de Uso do portal Painel do Agronegócio.',
    heading: 'Termos de Uso',
    content: `
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">Ao acessar e utilizar o portal Painel do Agronegócio, você concorda com os presentes Termos de Uso e com a nossa Política de Privacidade.</p>
      <h2 class="text-lg font-bold text-agro-gold mt-6 mb-2">1. Isenção de Responsabilidade Financeira</h2>
      <p class="text-sm text-muted-foreground leading-relaxed mb-4">As cotações de commodities e dados meteorológicos exibidos são informativos. O Painel do Agronegócio não se responsabiliza por decisões comerciais ou financeiras tomadas com base nas informações do site.</p>
    `
  }
];

pagesConfig.forEach(page => {
  const pageDir = path.join(distDir, page.slug);
  ensureDir(pageDir);

  const pageBodyHtml = `
    <div class="min-h-screen flex flex-col">
      ${generateHeaderHtml()}
      <main class="container mx-auto px-4 pt-40 pb-12 flex-grow max-w-4xl">
        <div class="glass-panel p-6 md:p-10 rounded-2xl space-y-6">
          <h1 class="text-2xl md:text-3xl font-bold font-heading text-gold-gradient mb-4">${escapeHtml(page.heading)}</h1>
          ${page.content}
        </div>
      </main>
      ${generateFooterHtml()}
    </div>
  `;

  const pageHtml = buildHtmlPage({
    title: page.title,
    description: page.description,
    canonicalUrl: `https://painelagrofocus.com/${page.slug}`,
    bodyHtml: pageBodyHtml
  });

  fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf-8');
  console.log(`  ✅ Pre-rendered static page: /${page.slug}/index.html`);
});

console.log('🎉 SSG Pre-rendering completed successfully!');
