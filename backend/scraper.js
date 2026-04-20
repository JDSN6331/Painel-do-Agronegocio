import puppeteer from 'puppeteer';
import os from 'os';
import path from 'path';
import fs from 'fs';

// ===========================================
// NOTÍCIAS AGRÍCOLAS - FONTE ÚNICA DE COTAÇÕES
// Dados CEPEA/ESALQ coletados via Notícias Agrícolas
// ===========================================

// URLs das cotações no Notícias Agrícolas
const NA_URLS = {
    dolar: 'https://www.noticiasagricolas.com.br/cotacoes/mercado-financeiro',
    cafeICE: 'https://www.noticiasagricolas.com.br/cotacoes/cafe/cafe-bolsa-de-nova-iorque-nybot',
    cafeCEPEA: 'https://www.noticiasagricolas.com.br/cotacoes/cafe/indicador-cepea-esalq-cafe-arabica',
    milho: 'https://www.noticiasagricolas.com.br/cotacoes/milho/indicador-cepea-esalq-milho',
    // Paranaguá (B3) - referência para contratos futuros
    soja: 'https://www.noticiasagricolas.com.br/cotacoes/soja/soja-indicador-cepea-esalq-porto-paranagua',
    boiGordo: 'https://www.noticiasagricolas.com.br/cotacoes/boi-gordo/boi-gordo-indicador-esalq-bmf',
    leite: 'https://www.noticiasagricolas.com.br/cotacoes/leite'
};

// User agents para rotação
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(minMs, maxMs) {
    const delayTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    return delay(delayTime);
}

/**
 * Safely clean up a temporary directory with retry
 */
function cleanupTempDir(dirPath) {
    if (!dirPath) return;
    // Delay cleanup to give Chrome time to fully release files
    setTimeout(() => {
        try {
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true });
            }
        } catch (err) {
            // Retry once more after a longer delay
            setTimeout(() => {
                try {
                    if (fs.existsSync(dirPath)) {
                        fs.rmSync(dirPath, { recursive: true, force: true });
                    }
                } catch {}
            }, 10000);
        }
    }, 3000);
}

/**
 * Wrapper para retry automático em caso de falha
 * @param {Function} scrapeFn - Função de scraping a executar
 * @param {Object} browser - Instância do Puppeteer browser
 * @param {string} name - Nome da cotação para logs
 * @param {number} maxAttempts - Número máximo de tentativas (padrão: 3)
 * @returns {Promise<Object|null>} - Resultado da scraping ou null se falhar
 */
async function withRetry(scrapeFn, browser, name, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await scrapeFn();
            return result;
        } catch (error) {
            if (attempt < maxAttempts) {
                const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 8000); // exponential backoff
                console.log(`    ⚠️ Tentativa ${attempt}/${maxAttempts} falhou. Aguardando ${backoffDelay}ms antes de tentar novamente...`);
                await delay(backoffDelay);
            } else {
                console.error(`    ❌ Falha após ${maxAttempts} tentativas de coletar ${name}:`, error.message);
                return null;
            }
        }
    }
}

function formatCurrency(value, decimals = 2) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function parseNumber(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

function parseVariation(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[%\s]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Configuração padrão da página do browser
 */
async function setupPage(browser) {
    const page = await browser.newPage();
    await page.setUserAgent(getRandomUserAgent());
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    await page.setViewport({ width: 1920, height: 1080 });
    return page;
}

/**
 * Scrape Dólar do Notícias Agrícolas - Mercado Financeiro
 */
async function scrapeDolar(browser) {
    console.log('  📈 Coletando Dólar...');
    
    return withRetry(async () => {
        let page = null;
        try {
            page = await setupPage(browser);
            await page.goto(NA_URLS.dolar, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForSelector('table.cot-fisicas', { timeout: 10000 });

            const data = await page.evaluate(() => {
                const tables = document.querySelectorAll('table.cot-fisicas');
                for (const table of tables) {
                    const rows = table.querySelectorAll('tbody tr');
                    for (const row of rows) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 3) {
                            const currency = cells[0].innerText.trim();
                            if (currency === 'Dólar' || currency.toLowerCase().includes('dólar')) {
                                return {
                                    price: cells[1].innerText.trim(),
                                    variation: cells[2].innerText.trim()
                                };
                            }
                        }
                    }
                }
                return null;
            });

            await page.close();

            if (!data) {
                throw new Error('Dólar não encontrado na página');
            }

            const priceValue = parseNumber(data.price);
            const variationValue = parseVariation(data.variation);
            console.log(`    ✅ Dólar: R$ ${formatCurrency(priceValue)} (${variationValue >= 0 ? '+' : ''}${variationValue.toFixed(2)}%)`);

            return {
                name: 'Dólar',
                value: `R$ ${formatCurrency(priceValue)}`,
                change: parseFloat(variationValue.toFixed(2))
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });
            throw error;
        }
    }, browser, 'Dólar');
}

/**
 * Scrape Café ICE NY - Referência Internacional
 */
async function scrapeCafeICE(browser) {
    console.log('  ☕ Coletando Café ICE NY...');
    
    return withRetry(async () => {
        let page = null;
        try {
            page = await setupPage(browser);
            await page.goto(NA_URLS.cafeICE, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForSelector('table.cot-fisicas', { timeout: 10000 });

            const data = await page.evaluate(() => {
                const table = document.querySelector('table.cot-fisicas');
                if (!table) return null;

                const firstRow = table.querySelector('tbody tr:first-child');
                if (!firstRow) return null;

                const cells = firstRow.querySelectorAll('td');
                if (cells.length < 4) return null;

                return {
                    month: cells[0].innerText.trim(),
                    priceUSD: cells[1].innerText.trim(),
                    priceBRL: cells[2].innerText.trim(),
                    variationPoints: cells[3].innerText.trim()
                };
            });

            await page.close();

            if (!data) {
                throw new Error('Café ICE NY não encontrado na página');
            }

            const priceValue = parseNumber(data.priceBRL);
            const variationPoints = parseVariation(data.variationPoints);
            const priceUSD = parseNumber(data.priceUSD);
            const variationPercent = priceUSD > 0 ? (variationPoints / priceUSD) * 100 : 0;

            console.log(`    ✅ Café ICE NY: R$ ${formatCurrency(priceValue)} (${variationPercent >= 0 ? '+' : ''}${variationPercent.toFixed(2)}%)`);

            return {
                name: 'Café ICE NY',
                value: `R$ ${formatCurrency(priceValue)}`,
                change: parseFloat(variationPercent.toFixed(2))
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });
            throw error;
        }
    }, browser, 'Café ICE NY');
}

/**
 * Scrape indicador CEPEA/ESALQ genérico do Notícias Agrícolas
 * Funciona para: Café, Milho, Soja, Boi Gordo
 */
async function scrapeIndicator(browser, url, name) {
    console.log(`  📊 Coletando ${name}...`);
    
    return withRetry(async () => {
        let page = null;
        try {
            page = await setupPage(browser);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await page.waitForSelector('table.cot-fisicas', { timeout: 10000 });

            const data = await page.evaluate(() => {
                const tables = document.querySelectorAll('table.cot-fisicas');

                for (const table of tables) {
                    const headerText = table.querySelector('thead')?.innerText || '';
                    // Aceita "Valor", "à vista R$", ou apenas "R$" como indicadores de coluna de preço
                    const hasPrice = headerText.includes('Valor') || headerText.includes('à vista') || headerText.includes('R$');
                    const hasVariation = headerText.includes('Variação');

                    if (hasPrice && hasVariation) {
                        const firstRow = table.querySelector('tbody tr:first-child');
                        if (firstRow) {
                            const cells = firstRow.querySelectorAll('td');
                            if (cells.length >= 3) {
                                return {
                                    price: cells[1].innerText.trim(),
                                    variation: cells[2].innerText.trim()
                                };
                            }
                        }
                    }
                }
                return null;
            });

            await page.close();

            if (!data) {
                throw new Error(`${name} não encontrado na página`);
            }

            const priceValue = parseNumber(data.price);
            const variationValue = parseVariation(data.variation);

            console.log(`    ✅ ${name}: R$ ${formatCurrency(priceValue)} (${variationValue >= 0 ? '+' : ''}${variationValue.toFixed(2)}%)`);

            return {
                name,
                value: `R$ ${formatCurrency(priceValue)}`,
                change: parseFloat(variationValue.toFixed(2))
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });
            throw error;
        }
    }, browser, name);
}

/**
 * Scrape Leite (MG) do Notícias Agrícolas
 */
async function scrapeLeite(browser) {
    console.log('  🥛 Coletando Leite (MG)...');
    
    return withRetry(async () => {
        let page = null;
        try {
            page = await setupPage(browser);
            await page.goto(NA_URLS.leite, { waitUntil: 'networkidle2', timeout: 30000 });

            // Tentar fechar modal se existir
            try {
                await page.click('.fechar-box, .close-modal, [class*="close"]', { timeout: 2000 });
            } catch {
                // Sem modal para fechar
            }

            await page.waitForSelector('table.cot-fisicas', { timeout: 10000 });

            const data = await page.evaluate(() => {
                const tables = document.querySelectorAll('table.cot-fisicas');
                for (const table of tables) {
                    const rows = table.querySelectorAll('tbody tr');
                    for (const row of rows) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 3 && cells[0].innerText.trim() === 'MG') {
                            return {
                                price: cells[1].innerText.trim(),
                                variation: cells[2].innerText.trim()
                            };
                        }
                    }
                }
                return null;
            });

            await page.close();

            if (!data) {
                throw new Error('Leite (MG) não encontrado na página');
            }

            const priceValue = parseNumber(data.price);
            const variationValue = parseVariation(data.variation);

            console.log(`    ✅ Leite (MG): R$ ${formatCurrency(priceValue, 2)} (${variationValue >= 0 ? '+' : ''}${variationValue.toFixed(2)}%)`);

            return {
                name: 'Leite',
                value: `R$ ${formatCurrency(priceValue, 2)}`,
                change: parseFloat(variationValue.toFixed(2))
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });
            throw error;
        }
    }, browser, 'Leite');
}

/**
 * Coleta todas as cotações
 * Fonte única: Notícias Agrícolas (dados CEPEA/ESALQ e ICE NY)
 */
export async function collectQuotes() {
    console.log('\n📊 Iniciando coleta de cotações...');
    console.log('📰 Fonte: CEPEA/ESALQ (Notícias Agrícolas) e ICE NY');
    console.log('━'.repeat(50));

    const quotes = [];

    console.log('\n🌐 Iniciando browser...');
    let browser;
    const userDataDir = path.join(os.tmpdir(), `puppeteer_quotes_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`);
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            userDataDir,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080'
            ]
        });
    } catch (browserError) {
        console.error('❌ Falha ao iniciar browser:', browserError.message);
        cleanupTempDir(userDataDir);
        return { lastUpdate: new Date().toISOString(), quotes };
    }

    try {
        // Delay reduzido entre coletas (3-5s) - sem fallback = mais rápido
        const DELAY_MIN = 3000;
        const DELAY_MAX = 5000;

        // 1. Dólar
        const dolar = await scrapeDolar(browser);
        if (dolar) quotes.push(dolar);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 2. Café ICE NY (referência internacional)
        const cafeICE = await scrapeCafeICE(browser);
        if (cafeICE) quotes.push(cafeICE);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 3. Café CEPEA/ESALQ (mercado doméstico)
        const cafeCEPEA = await scrapeIndicator(browser, NA_URLS.cafeCEPEA, 'Café CEPEA/ESALQ');
        if (cafeCEPEA) quotes.push(cafeCEPEA);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 4. Milho CEPEA/ESALQ
        const milho = await scrapeIndicator(browser, NA_URLS.milho, 'Milho');
        if (milho) quotes.push(milho);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 5. Soja ESALQ/B3 Paranaguá (referência B3)
        const soja = await scrapeIndicator(browser, NA_URLS.soja, 'Soja');
        if (soja) quotes.push(soja);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 6. Boi Gordo ESALQ/B3
        const boiGordo = await scrapeIndicator(browser, NA_URLS.boiGordo, 'Boi Gordo');
        if (boiGordo) quotes.push(boiGordo);
        await randomDelay(DELAY_MIN, DELAY_MAX);

        // 7. Leite (MG)
        const leite = await scrapeLeite(browser);
        if (leite) quotes.push(leite);

    } finally {
        try {
            await browser.close();
        } catch (closeErr) {
            console.error('⚠️ Erro ao fechar browser:', closeErr.message);
            try { browser.process()?.kill(); } catch {}
        }
        console.log('\n🌐 Browser fechado.');
        cleanupTempDir(userDataDir);
    }

    console.log('━'.repeat(50));
    console.log(`✅ Coleta concluída. ${quotes.length} cotações coletadas.\n`);

    return {
        lastUpdate: new Date().toISOString(),
        quotes
    };
}
