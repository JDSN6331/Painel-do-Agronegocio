import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

// CEPEA indicator URLs
const CEPEA_URLS = {
    cafe: 'https://www.cepea.org.br/br/indicador/cafe.aspx',
    milho: 'https://www.cepea.org.br/br/indicador/milho.aspx',
    soja: 'https://www.cepea.org.br/br/indicador/soja.aspx',
    boiGordo: 'https://www.cepea.org.br/br/indicador/boi-gordo.aspx'
};

// Café ICE NY from Notícias Agrícolas (international reference)
const CAFE_ICE_NY_URL = 'https://www.noticiasagricolas.com.br/cotacoes/cafe/cafe-bolsa-de-nova-iorque-nybot';

// Leite from Notícias Agrícolas
const LEITE_URL = 'https://www.noticiasagricolas.com.br/cotacoes/leite';

// List of user agents to rotate (appear as different browsers)
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

/**
 * Format number to Brazilian currency style
 */
function formatCurrency(value, decimals = 2) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Parse Brazilian number format to float
 */
function parseNumber(str) {
    if (!str) return 0;
    // Remove R$ and spaces, then convert comma to dot
    const cleaned = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Parse variation string to number
 */
function parseVariation(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[%\s]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

/**
 * Scrape Dollar from Notícias Agrícolas - Mercado Financeiro
 * Uses the same structure as Leite scraper (table.cot-fisicas)
 */
async function scrapeDolar(browser) {
    console.log('  Scraping Dólar from Notícias Agrícolas (Mercado Financeiro)...');

    const DOLAR_URL = 'https://www.noticiasagricolas.com.br/cotacoes/mercado-financeiro';
    const MAX_RETRIES = 3;
    const TIMEOUTS = [45000, 60000, 90000];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const timeout = TIMEOUTS[attempt - 1] || TIMEOUTS[TIMEOUTS.length - 1];
        let page = null;

        try {
            if (attempt > 1) {
                console.log(`    🔄 Retry attempt ${attempt}/${MAX_RETRIES}...`);
                await delay(5000 * attempt);
            }

            page = await browser.newPage();
            await page.setUserAgent(getRandomUserAgent());
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            });
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(DOLAR_URL, { waitUntil: 'networkidle2', timeout });

            // Wait for the table to load
            await page.waitForSelector('table.cot-fisicas', { timeout: 15000 });

            await randomDelay(500, 1500);

            // Extract data - find the row with "Dólar"
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
                                    price: cells[1].innerText.trim(), // Valor
                                    variation: cells[2].innerText.trim() // Variação
                                };
                            }
                        }
                    }
                }

                return null;
            });

            await page.close();

            if (!data) {
                console.log('    ⚠️ No Dólar data found');
                return null;
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

            if (attempt < MAX_RETRIES) {
                console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
            } else {
                console.error(`    ❌ Error scraping Dólar after ${MAX_RETRIES} attempts:`, error.message);
                return null;
            }
        }
    }

    return null;
}

/**
     * Scrape Café ICE NY from Notícias Agrícolas
     * Uses the converted R$/saca value for consistency
     */
async function scrapeCafeICE(browser) {
    console.log('  Scraping Café ICE NY from Notícias Agrícolas...');

    const MAX_RETRIES = 3;
    const TIMEOUTS = [45000, 60000, 90000];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const timeout = TIMEOUTS[attempt - 1] || TIMEOUTS[TIMEOUTS.length - 1];
        let page = null;

        try {
            if (attempt > 1) {
                console.log(`    🔄 Retry attempt ${attempt}/${MAX_RETRIES}...`);
                await delay(5000 * attempt);
            }

            page = await browser.newPage();
            await page.setUserAgent(getRandomUserAgent());
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            });
            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(CAFE_ICE_NY_URL, { waitUntil: 'networkidle2', timeout });

            // Wait for the table to load
            await page.waitForSelector('table.cot-fisicas', { timeout: 15000 });

            await randomDelay(500, 1500);

            // Extract data from the first row (first contract month)
            const data = await page.evaluate(() => {
                const table = document.querySelector('table.cot-fisicas');
                if (!table) return null;

                const firstRow = table.querySelector('tbody tr:first-child');
                if (!firstRow) return null;

                const cells = firstRow.querySelectorAll('td');
                if (cells.length < 4) return null;

                // Columns: 0=Month, 1=¢/lb, 2=R$/saca, 3=Variation (points)
                return {
                    month: cells[0].innerText.trim(),
                    priceUSD: cells[1].innerText.trim(),
                    priceBRL: cells[2].innerText.trim(),
                    variationPoints: cells[3].innerText.trim()
                };
            });

            await page.close();

            if (!data) {
                console.log('    ⚠️ No Café ICE NY data found');
                return null;
            }

            // Parse the R$/saca price (Brazilian format: 2.566,88)
            const priceValue = parseNumber(data.priceBRL);

            // Parse variation (in points, e.g., "+2,05" or "-1,50")
            const variationPoints = parseVariation(data.variationPoints);

            // Calculate percentage variation (approximate: points / price * 100)
            // ICE NY trades in cents/lb, so the variation is already in cents
            const priceUSD = parseNumber(data.priceUSD);
            const variationPercent = priceUSD > 0 ? (variationPoints / priceUSD) * 100 : 0;

            console.log(`    ✅ Café ICE NY (${data.month}): R$ ${formatCurrency(priceValue)} (${variationPercent >= 0 ? '+' : ''}${variationPercent.toFixed(2)}%)`);

            return {
                name: 'Café ICE NY',
                month: data.month,
                value: `R$ ${formatCurrency(priceValue)}`,
                change: parseFloat(variationPercent.toFixed(2))
            };

        } catch (error) {
            if (page) await page.close().catch(() => { });

            if (attempt < MAX_RETRIES) {
                console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
            } else {
                console.error(`    ❌ Error scraping Café ICE NY after ${MAX_RETRIES} attempts:`, error.message);
                return null;
            }
        }
    }

    return null;
}

/**
 * Scrape CEPEA page for commodity data with retry logic and rate limiting
 */
async function scrapeCepea(browser, url, name) {
    console.log(`  Scraping CEPEA: ${name}...`);

    const MAX_RETRIES = 3;
    const TIMEOUTS = [45000, 60000, 90000];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const timeout = TIMEOUTS[attempt - 1] || TIMEOUTS[TIMEOUTS.length - 1];
        let page = null;

        try {
            if (attempt > 1) {
                console.log(`    🔄 Retry attempt ${attempt}/${MAX_RETRIES} (timeout: ${timeout / 1000}s)...`);
                await delay(5000 * attempt);
            }

            page = await browser.newPage();

            const userAgent = getRandomUserAgent();
            await page.setUserAgent(userAgent);

            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            });

            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(url, { waitUntil: 'networkidle2', timeout });

            await page.waitForSelector('#imagenet-indicador1', { timeout: 15000 });

            await randomDelay(500, 1500);

            const data = await page.evaluate(() => {
                const table = document.querySelector('#imagenet-indicador1');
                if (!table) return null;

                const firstRow = table.querySelector('tbody tr:first-child');
                if (!firstRow) return null;

                const cells = firstRow.querySelectorAll('td');
                if (cells.length < 3) return null;

                return {
                    price: cells[1].innerText.trim(),
                    variation: cells[2].innerText.trim()
                };
            });

            await page.close();

            if (!data) {
                console.log(`    ⚠️ No data found for ${name}`);
                return null;
            }

            const priceValue = parseNumber(data.price);
            const variationValue = parseVariation(data.variation);

            console.log(`    ✅ ${name}: R$ ${formatCurrency(priceValue)} (${variationValue >= 0 ? '+' : ''}${variationValue}%)`);

            return {
                name,
                value: `R$ ${formatCurrency(priceValue)}`,
                change: variationValue
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });

            if (attempt < MAX_RETRIES) {
                console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
            } else {
                console.error(`    ❌ Error scraping ${name} after ${MAX_RETRIES} attempts:`, error.message);
                return null;
            }
        }
    }

    return null;
}

/**
 * Scrape milk price from Notícias Agrícolas with retry logic and rate limiting
 */
async function scrapeLeite(browser) {
    console.log('  Scraping Leite (MG) from Notícias Agrícolas...');

    const MAX_RETRIES = 3;
    const TIMEOUTS = [45000, 60000, 90000];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const timeout = TIMEOUTS[attempt - 1] || TIMEOUTS[TIMEOUTS.length - 1];
        let page = null;

        try {
            if (attempt > 1) {
                console.log(`    🔄 Retry attempt ${attempt}/${MAX_RETRIES} (timeout: ${timeout / 1000}s)...`);
                await delay(5000 * attempt);
            }

            page = await browser.newPage();

            await page.setUserAgent(getRandomUserAgent());

            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            });

            await page.setViewport({ width: 1920, height: 1080 });

            await page.goto(LEITE_URL, { waitUntil: 'networkidle2', timeout });

            try {
                await page.click('.fechar-box, .close-modal, [class*="close"]', { timeout: 3000 });
            } catch {
                // No modal to close
            }

            await page.waitForSelector('table.cot-fisicas', { timeout: 15000 });

            await randomDelay(500, 1500);

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
                console.log('    ⚠️ No MG data found for Leite');
                return null;
            }

            const priceValue = parseNumber(data.price);
            const variationValue = parseVariation(data.variation);

            console.log(`    ✅ Leite (MG): R$ ${formatCurrency(priceValue, 4)} (${variationValue >= 0 ? '+' : ''}${variationValue}%)`);

            return {
                name: 'Leite',
                value: `R$ ${formatCurrency(priceValue, 2)}`,
                change: variationValue
            };
        } catch (error) {
            if (page) await page.close().catch(() => { });

            if (attempt < MAX_RETRIES) {
                console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
            } else {
                console.error(`    ❌ Error scraping Leite after ${MAX_RETRIES} attempts:`, error.message);
                return null;
            }
        }
    }

    return null;
}

/**
 * Collect all quotes with delays between each scrape
 */
export async function collectQuotes() {
    console.log('\n📊 Starting quotes collection...');
    console.log('━'.repeat(50));

    const quotes = [];

    // Launch browser for scraping all quotes
    console.log('\n🌐 Launching browser...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
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
        console.error('❌ Failed to launch browser:', browserError.message);
        console.log('⚠️ Returning partial quotes data (only Dollar)');
        return {
            lastUpdate: new Date().toISOString(),
            quotes
        };
    }

    try {
        // Scrape Dólar first
        const dolar = await scrapeDolar(browser);
        if (dolar) quotes.push(dolar);

        console.log('    ⏳ Waiting before next commodity...');
        await randomDelay(8000, 12000);

        // Scrape Café - both ICE NY (international) and CEPEA (domestic)
        const cafeICE = await scrapeCafeICE(browser);

        console.log('    ⏳ Waiting before next commodity...');
        await randomDelay(8000, 12000);

        const cafeCEPEA = await scrapeCepea(browser, CEPEA_URLS.cafe, 'Café Arábica');

        // Add both coffee quotes as separate cards
        if (cafeICE) {
            quotes.push({
                name: 'Café ICE NY',
                value: cafeICE.value,
                change: cafeICE.change
            });
        }
        if (cafeCEPEA) {
            quotes.push({
                name: 'Café CEPEA/ESALQ',
                value: cafeCEPEA.value,
                change: cafeCEPEA.change
            });
        }

        console.log('    ⏳ Waiting before next commodity...');
        await randomDelay(8000, 12000);

        // Scrape CEPEA commodities with delays between each
        const milho = await scrapeCepea(browser, CEPEA_URLS.milho, 'Milho');
        if (milho) quotes.push(milho);

        await randomDelay(8000, 12000);

        const soja = await scrapeCepea(browser, CEPEA_URLS.soja, 'Soja');
        if (soja) quotes.push(soja);

        await randomDelay(8000, 12000);

        const boiGordo = await scrapeCepea(browser, CEPEA_URLS.boiGordo, 'Boi Gordo');
        if (boiGordo) quotes.push(boiGordo);

        await randomDelay(8000, 12000);

        // Scrape milk from Notícias Agrícolas
        const leite = await scrapeLeite(browser);
        if (leite) quotes.push(leite);

    } finally {
        await browser.close();
        console.log('\n🌐 Browser closed.');
    }

    console.log('━'.repeat(50));
    console.log(`✅ Collection complete. ${quotes.length} quotes collected.\n`);

    return {
        lastUpdate: new Date().toISOString(),
        quotes
    };
}
