# Requisitos de Sistema e Ambiente — Painel do Agronegócio

Este documento descreve todos os requisitos de hardware, software, rede e sistema operacional necessários para a execução local e implantação do **Painel do Agronegócio**.

---

## 1. Requisitos de Software

### Runtime & Gerenciador de Pacotes
- **Node.js**: Versão `18.x` ou `20.x LTS` (Recomendado: `v20.11.0` ou superior).
- **npm**: Versão `9.x` ou `10.x`.

---

## 2. Requisitos de Sistema Operacional (Puppeteer / Scraping)

O módulo de backend utiliza o **Puppeteer** para automação de coleta de cotações e notícias em tempo real. Dependendo do ambiente de implantação, são necessárias as seguintes dependências de sistema:

### Linux (Ubuntu / Debian)
```bash
sudo apt-get update && sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### Windows (10 / 11 / Server)
- Nenhuma biblioteca adicional necessária. O Chromium é instalado automaticamente pelo Puppeteer durante o `npm install`.

---

## 3. Requisitos de Rede e Portas

- **Porta Frontend (Vite Dev Server)**: `5173` (ou porta configurada via CLI)
- **Porta Backend (Express Scraping API)**: `8080` ou `8085`
- **Acesso à Internet**:
  - `https://api.awesomeapi.com.br` (Cotação do Dólar)
  - `https://api.open-meteo.com` (Previsão do Tempo)
  - `https://news.google.com` (Feeds de notícias RSS)

---

## 4. Requisitos de Mídia e Arquivos Estáticos

- **Imagens dos Artigos**: Todas as imagens de artigos devem estar disponíveis no diretório estático `public/images/articles/` (`article-1.jpg` a `article-16.jpg`).
- **Imagens de Fallback**: Imagens de reserva armazenadas em `public/images/fallbacks/` (`default-agro.jpg`, `cooxupe.jpg`, `inovacao.jpg`).
- **Permissão de Escrita**: O processo do Node.js deve possuir permissão de escrita no diretório `public/data/` para salvar os arquivos JSON de cotações, clima e notícias atualizados em tempo real.

---

## 5. Comandos de Inicialização

```bash
# Instalação completa de dependências
npm install

# Execução em ambiente de desenvolvimento (Frontend + Backend)
npm run dev

# Compilação para produção
npm run build
```
