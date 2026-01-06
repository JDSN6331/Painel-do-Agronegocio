// Backend with dual-cycle architecture for data collection
// Fast Cycle: Quotes + Weather (every 5 min after completion)
// Heavy Cycle: News (every 30 min after completion)
// PAUSE SUPPORT: Heavy cycle pauses BETWEEN CATEGORIES for fast cycle to run

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collectQuotes } from './scraper.js';
import { collectWeather } from './weather.js';
import {
    getCategoryCount,
    launchNewsBrowser,
    closeNewsBrowser,
    collectSingleCategory,
    buildNewsData
} from './news.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output path for JSON files (in public/data folder)
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const QUOTES_FILE = path.join(OUTPUT_DIR, 'quotes.json');
const WEATHER_FILE = path.join(OUTPUT_DIR, 'weather.json');
const NEWS_FILE = path.join(OUTPUT_DIR, 'news.json');

// ═══════════════════════════════════════════════════════════════════
// CYCLE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

// Fast cycle: Quotes + Weather - runs every 5 minutes AFTER completion
const FAST_CYCLE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Heavy cycle: News - runs every 30 minutes AFTER completion
const HEAVY_CYCLE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// ═══════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

let isFastCycleRunning = false;
let isHeavyCycleRunning = false;
let lastFastCycleEnd = 0;

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
 * Ensure the output directory exists
 */
function ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Created directory: ${OUTPUT_DIR}`);
    }
}

/**
 * Count total news items in a news data object
 */
function countNewsItems(newsData) {
    if (!newsData || !newsData.categories) return 0;
    return newsData.categories.reduce((total, cat) => total + (cat.news?.length || 0), 0);
}

/**
 * Smart save for news: only overwrites if new data has enough items
 */
function saveNewsIfValid(filename, newData) {
    ensureOutputDir();

    const newCount = countNewsItems(newData);
    const MIN_NEWS_REQUIRED = 18;

    if (newCount < MIN_NEWS_REQUIRED) {
        console.log(`⚠️ Coleta retornou apenas ${newCount} notícias (mínimo: ${MIN_NEWS_REQUIRED})`);

        if (fs.existsSync(filename)) {
            try {
                const previousData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
                const previousCount = countNewsItems(previousData);

                if (previousCount > newCount) {
                    console.log(`🛡️ Mantendo arquivo anterior com ${previousCount} notícias`);
                    return false;
                }
            } catch (error) {
                console.log(`⚠️ Erro ao ler arquivo anterior: ${error.message}`);
            }
        }
    }

    fs.writeFileSync(filename, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`💾 Saved ${newCount} news items to: ${filename}`);
    return true;
}

/**
 * Smart save for quotes
 */
function saveQuotesIfValid(filename, newData) {
    ensureOutputDir();

    const newCount = newData?.quotes?.length || 0;
    let previousCount = 0;

    if (fs.existsSync(filename)) {
        try {
            const previousData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            previousCount = previousData?.quotes?.length || 0;
        } catch (error) {
            console.log(`⚠️ Erro ao ler arquivo anterior: ${error.message}`);
        }
    }

    if (newCount < previousCount) {
        console.log(`⚠️ Coleta retornou apenas ${newCount} cotações (anterior tinha ${previousCount})`);
        console.log(`🛡️ Mantendo arquivo anterior com ${previousCount} cotações`);
        return false;
    }

    fs.writeFileSync(filename, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`💾 Saved ${newCount} quotes to: ${filename}`);
    return true;
}

/**
 * Smart save for weather
 */
function saveWeatherIfValid(filename, newData) {
    ensureOutputDir();

    const newCount = newData?.weather?.length || 0;
    let previousCount = 0;

    if (fs.existsSync(filename)) {
        try {
            const previousData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            previousCount = previousData?.weather?.length || 0;
        } catch (error) {
            console.log(`⚠️ Erro ao ler arquivo anterior: ${error.message}`);
        }
    }

    if (newCount < previousCount) {
        console.log(`⚠️ Coleta retornou apenas ${newCount} cidades (anterior tinha ${previousCount})`);
        console.log(`🛡️ Mantendo arquivo anterior com ${previousCount} cidades`);
        return false;
    }

    fs.writeFileSync(filename, JSON.stringify(newData, null, 2), 'utf-8');
    console.log(`💾 Saved ${newCount} weather items to: ${filename}`);
    return true;
}

/**
 * Format duration in minutes and seconds
 */
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

/**
 * Check if fast cycle is due (5 min since last completion)
 */
function isFastCycleDue() {
    if (lastFastCycleEnd === 0) return false; // Not started yet
    return (Date.now() - lastFastCycleEnd) >= FAST_CYCLE_INTERVAL_MS;
}

// ═══════════════════════════════════════════════════════════════════
// FAST CYCLE: Quotes + Weather (every 5 min)
// ═══════════════════════════════════════════════════════════════════

async function runFastCycle() {
    if (isFastCycleRunning) {
        console.log('⚠️ Ciclo rápido já está rodando. Ignorando...');
        return;
    }

    isFastCycleRunning = true;
    const cycleStart = Date.now();

    console.log('\n');
    console.log('═'.repeat(50));
    console.log(`⚡ CICLO RÁPIDO - ${new Date().toLocaleTimeString('pt-BR')}`);
    console.log('═'.repeat(50));

    try {
        // STEP 1: COTAÇÕES
        console.log('\n📊 [1/2] COTAÇÕES');
        console.log('─'.repeat(40));
        try {
            const quotesData = await collectQuotes();
            const saved = saveQuotesIfValid(QUOTES_FILE, quotesData);
            if (saved) {
                console.log('✅ Cotações salvas com sucesso!');
            } else {
                console.log('⚠️ Mantendo cotações anteriores');
            }
        } catch (error) {
            console.error('❌ Erro na coleta de cotações:', error.message);
        }

        // Wait before weather
        console.log('\n⏳ Aguardando 5 segundos...');
        await delay(5000);

        // STEP 2: CLIMA
        console.log('\n🌤️ [2/2] CLIMA');
        console.log('─'.repeat(40));
        try {
            const weatherData = await collectWeather();
            const saved = saveWeatherIfValid(WEATHER_FILE, weatherData);
            if (saved) {
                console.log('✅ Clima salvo com sucesso!');
            } else {
                console.log('⚠️ Mantendo clima anterior');
            }
        } catch (error) {
            console.error('❌ Erro na coleta de clima:', error.message);
        }

    } finally {
        isFastCycleRunning = false;
        lastFastCycleEnd = Date.now();
    }

    const cycleEnd = Date.now();
    const duration = formatDuration(cycleEnd - cycleStart);
    const nextCycle = new Date(Date.now() + FAST_CYCLE_INTERVAL_MS);

    console.log('\n');
    console.log('─'.repeat(50));
    console.log(`✅ Ciclo rápido completo em ${duration}`);
    console.log(`⏰ Próximo ciclo rápido: ${nextCycle.toLocaleTimeString('pt-BR')} (5 min)`);
    console.log('─'.repeat(50));
}

// ═══════════════════════════════════════════════════════════════════
// HEAVY CYCLE: News (every 30 min) with PAUSE SUPPORT
// ═══════════════════════════════════════════════════════════════════

async function runHeavyCycle() {
    // WAIT if fast cycle is currently running
    if (isFastCycleRunning) {
        console.log('⏳ Aguardando ciclo rápido terminar antes de iniciar ciclo pesado...');
        while (isFastCycleRunning) {
            await delay(1000);
        }
        console.log('✅ Ciclo rápido terminou. Iniciando ciclo pesado...');
    }

    isHeavyCycleRunning = true;
    const cycleStart = Date.now();
    const categoryCount = getCategoryCount();
    const collectedCategories = [];
    let browser = null;

    console.log('\n');
    console.log('═'.repeat(50));
    console.log(`📰 CICLO PESADO (NOTÍCIAS) - ${new Date().toLocaleTimeString('pt-BR')}`);
    console.log(`   ${categoryCount} categorias para coletar`);
    console.log('═'.repeat(50));

    try {
        // Launch browser
        console.log('\n🌐 Launching browser...');
        browser = await launchNewsBrowser();
        console.log('  ✅ Browser launched');

        // Collect each category, checking for fast cycle between each
        for (let i = 0; i < categoryCount; i++) {
            // CHECK: Is fast cycle due? (BEFORE starting category)
            if (isFastCycleDue()) {
                console.log('\n');
                console.log('⏸️'.repeat(25));
                console.log(`⏸️ PAUSANDO coleta de notícias (antes da categoria ${i + 1}/${categoryCount})`);
                console.log(`   Ciclo rápido precisa rodar!`);
                console.log('⏸️'.repeat(25));

                // Close browser before fast cycle (to avoid resource conflicts)
                if (browser) {
                    await closeNewsBrowser(browser);
                    browser = null;
                    console.log('  🌐 Browser fechado temporariamente');
                }

                // Run fast cycle
                await runFastCycle();

                // Reopen browser to continue
                console.log('\n▶️ Retomando coleta de notícias...');
                console.log('🌐 Reabrindo browser...');
                browser = await launchNewsBrowser();
                console.log('  ✅ Browser relaunched');
            }

            // Collect this category
            console.log(`\n📰 [${i + 1}/${categoryCount}] Coletando categoria...`);
            try {
                const categoryData = await collectSingleCategory(browser, i);
                collectedCategories.push(categoryData);
                console.log(`  ✅ ${categoryData.title}: ${categoryData.news.length} notícias`);
            } catch (error) {
                console.error(`  ❌ Erro na categoria ${i + 1}:`, error.message);
            }

            // Delay between categories
            if (i < categoryCount - 1) {
                console.log(`    ⏳ Aguardando antes da próxima categoria...`);
                await randomDelay(10000, 15000);
            }
        }

        // Build and save news data
        if (collectedCategories.length > 0) {
            const newsData = buildNewsData(collectedCategories);
            const saved = saveNewsIfValid(NEWS_FILE, newsData);
            if (saved) {
                console.log('✅ Notícias salvas com sucesso!');
            } else {
                console.log('⚠️ Mantendo notícias anteriores');
            }
        }

    } catch (error) {
        console.error('❌ Erro no ciclo pesado:', error.message);
    } finally {
        if (browser) {
            await closeNewsBrowser(browser);
            console.log('  🌐 Browser closed');
        }
        isHeavyCycleRunning = false;
    }

    const cycleEnd = Date.now();
    const duration = formatDuration(cycleEnd - cycleStart);
    const nextCycle = new Date(Date.now() + HEAVY_CYCLE_INTERVAL_MS);

    console.log('\n');
    console.log('─'.repeat(50));
    console.log(`✅ Ciclo pesado completo em ${duration}`);
    console.log(`⏰ Próximo ciclo pesado: ${nextCycle.toLocaleTimeString('pt-BR')} (30 min)`);
    console.log('─'.repeat(50));

    // Schedule next heavy cycle
    setTimeout(() => runHeavyCycle(), HEAVY_CYCLE_INTERVAL_MS);
}

// ═══════════════════════════════════════════════════════════════════
// FAST CYCLE SCHEDULER - Only runs when heavy cycle is NOT active
// ═══════════════════════════════════════════════════════════════════

function scheduleFastCycleCheck() {
    setTimeout(async () => {
        // IMPORTANT: Only run if heavy cycle is NOT running
        // If heavy cycle IS running, it handles fast cycle internally (between categories)
        if (!isHeavyCycleRunning && !isFastCycleRunning) {
            await runFastCycle();
        } else if (isHeavyCycleRunning) {
            console.log('⏳ Ciclo rápido será executado pelo ciclo pesado (entre categorias)');
        }
        // Schedule next check
        scheduleFastCycleCheck();
    }, FAST_CYCLE_INTERVAL_MS);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   🚀 Field Focus Board - Data Collection Backend          ║');
console.log('║   📌 Version: 4.3 (Fixed Parallel Execution)              ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║   ⚡ Ciclo Rápido: Cotações + Clima (a cada 5 min)        ║');
console.log('║   📰 Ciclo Pesado: Notícias (a cada 30 min)               ║');
console.log('║   ⏸️ Pausa ENTRE CATEGORIAS para ciclo rápido             ║');
console.log('║   🔒 Timer só roda se ciclo pesado NÃO está ativo         ║');
console.log('║   🔒 Intervalo contado APÓS término do ciclo              ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

// Initial execution
console.log('⏰ Iniciando primeira coleta...\n');

(async () => {
    // Run fast cycle first
    await runFastCycle();

    // Start fast cycle scheduler (only runs when heavy is NOT active)
    scheduleFastCycleCheck();

    // Start heavy cycle (news)
    await runHeavyCycle();
})();

console.log('✅ Backend rodando. Pressione Ctrl+C para parar.\n');
