# Implementação de Retry para Scraping de Cotações

## 📋 Resumo
Implementado sistema de **3 tentativas automáticas** para cada cotação em caso de falha (timeout ou erro).

## 🔧 Alterações Realizadas

### 1. Nova Função Wrapper: `withRetry()`
- **Localização**: [backend/scraper.js](backend/scraper.js#L42)
- **Funcionalidade**: Executa uma função de scraping com até 3 tentativas
- **Características**:
  - ✅ Retry automático em caso de erro
  - ✅ Backoff exponencial (1s → 2s → 4s → máximo 8s)
  - ✅ Logs informativos de cada tentativa
  - ✅ Máximo de 3 tentativas (configurável)

### 2. Funções Atualizadas com Retry

#### a) `scrapeDolar()`
- Agora tenta até 3 vezes em caso de falha
- Logs: Mostra cada tentativa realizada

#### b) `scrapeCafeICE()`
- Implementado retry automático
- Backoff exponencial entre tentativas

#### c) `scrapeIndicator()`
- Genérica para: Café CEPEA, Milho, Soja, Boi Gordo
- 3 tentativas por indicador

#### d) `scrapeLeite()`
- Implementado retry automático
- Tratamento de modal incluído

## 📊 Comportamento do Retry

```
Tentativa 1: Falha → Aguarda 1s
Tentativa 2: Falha → Aguarda 2s
Tentativa 3: Falha → Aguarda 4s → Retorna null
```

### Logs de Exemplo
```
  📈 Coletando Dólar...
    ⚠️ Tentativa 1/3 falhou. Aguardando 1000ms antes de tentar novamente...
    ✅ Dólar: R$ 5,10 (+0,50%)
```

## 🎯 Benefícios

1. **Maior Confiabilidade**: Reduz falhas por timeout temporários
2. **Backoff Inteligente**: Evita sobrecarregar o servidor com tentativas imediatas
3. **Melhor Observabilidade**: Logs detalhados de cada tentativa
4. **Sem Alterações na API**: Funções mantêm a mesma interface

## ⚙️ Configuração

Para ajustar o número máximo de tentativas, modifique a chamada em [backend/scraper.js](backend/scraper.js#L313-L331):

```javascript
// Padrão: 3 tentativas
const dolar = await scrapeDolar(browser);

// Customizado (exemplo: 5 tentativas)
// return withRetry(scrapeFn, browser, name, 5);
```

## 🚀 Impacto em AWS EC2

Esta implementação é especialmente útil em ambientes AWS EC2 onde:
- ✅ Timeouts ocasionais são comuns
- ✅ A banda larga pode ter variações
- ✅ Reduz necessidade de restarts manuais
- ✅ Mantém a aplicação mais resiliente

## 📝 Data de Implementação
Janeiro 12, 2026
