# Documentação de Dependências - Field Focus Board

Este documento lista todas as dependências necessárias para executar a aplicação, incluindo requisitos de sistema. Útil para deploy em arquiteturas de nuvem.

---

## 📋 Requisitos do Sistema

### Runtime
| Requisito | Versão Mínima | Recomendada |
|-----------|---------------|-------------|
| **Node.js** | 18.x | 20.x LTS |
| **npm** | 9.x | 10.x |

### Dependências do Sistema Operacional (para Puppeteer)
O backend utiliza **Puppeteer** para web scraping, que requer dependências adicionais do sistema.

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y \
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
  libgcc1 \
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

#### Alpine Linux (Docker)
```dockerfile
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont
```

---

## 🖥️ Frontend (Vite + React + TypeScript)

**Diretório:** `/` (raiz do projeto)  
**Gerenciador de Pacotes:** npm  
**Arquivo de configuração:** `package.json`

### Dependências de Produção

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `@fontsource/montserrat` | ^5.2.8 | Fonte Montserrat |
| `@hookform/resolvers` | ^3.10.0 | Validadores para React Hook Form |
| `@radix-ui/react-accordion` | ^1.2.11 | Componente Accordion |
| `@radix-ui/react-alert-dialog` | ^1.1.14 | Diálogo de Alerta |
| `@radix-ui/react-aspect-ratio` | ^1.1.7 | Proporção de Aspecto |
| `@radix-ui/react-avatar` | ^1.1.10 | Componente Avatar |
| `@radix-ui/react-checkbox` | ^1.3.2 | Componente Checkbox |
| `@radix-ui/react-collapsible` | ^1.1.11 | Componente Collapsible |
| `@radix-ui/react-context-menu` | ^2.2.15 | Menu de Contexto |
| `@radix-ui/react-dialog` | ^1.1.14 | Componente Dialog |
| `@radix-ui/react-dropdown-menu` | ^2.1.15 | Menu Dropdown |
| `@radix-ui/react-hover-card` | ^1.1.14 | Hover Card |
| `@radix-ui/react-label` | ^2.1.7 | Componente Label |
| `@radix-ui/react-menubar` | ^1.1.15 | Barra de Menu |
| `@radix-ui/react-navigation-menu` | ^1.2.13 | Menu de Navegação |
| `@radix-ui/react-popover` | ^1.1.14 | Componente Popover |
| `@radix-ui/react-progress` | ^1.1.7 | Barra de Progresso |
| `@radix-ui/react-radio-group` | ^1.3.7 | Grupo de Radio Buttons |
| `@radix-ui/react-scroll-area` | ^1.2.9 | Área de Scroll |
| `@radix-ui/react-select` | ^2.2.5 | Componente Select |
| `@radix-ui/react-separator` | ^1.1.7 | Separador |
| `@radix-ui/react-slider` | ^1.3.5 | Componente Slider |
| `@radix-ui/react-slot` | ^1.2.3 | Slot Pattern |
| `@radix-ui/react-switch` | ^1.2.5 | Componente Switch |
| `@radix-ui/react-tabs` | ^1.1.12 | Componente Tabs |
| `@radix-ui/react-toast` | ^1.2.14 | Notificações Toast |
| `@radix-ui/react-toggle` | ^1.1.9 | Componente Toggle |
| `@radix-ui/react-toggle-group` | ^1.1.10 | Grupo de Toggles |
| `@radix-ui/react-tooltip` | ^1.2.7 | Tooltips |
| `@tanstack/react-query` | ^5.83.0 | Gerenciamento de estado/cache de dados |
| `class-variance-authority` | ^0.7.1 | Utilitário para variantes de classes |
| `clsx` | ^2.1.1 | Utilitário para classes condicionais |
| `cmdk` | ^1.1.1 | Command Menu |
| `date-fns` | ^3.6.0 | Utilitários para datas |
| `embla-carousel-react` | ^8.6.0 | Carrossel |
| `input-otp` | ^1.4.2 | Input OTP |
| `lucide-react` | ^0.462.0 | Biblioteca de ícones |
| `next-themes` | ^0.3.0 | Temas claro/escuro |
| `react` | ^18.3.1 | Biblioteca React |
| `react-day-picker` | ^8.10.1 | Seletor de datas |
| `react-dom` | ^18.3.1 | React DOM |
| `react-hook-form` | ^7.61.1 | Gerenciamento de formulários |
| `react-resizable-panels` | ^2.1.9 | Painéis redimensionáveis |
| `react-router-dom` | ^6.30.1 | Roteamento |
| `recharts` | ^2.15.4 | Gráficos |
| `sonner` | ^1.7.4 | Notificações toast |
| `tailwind-merge` | ^2.6.0 | Merge de classes Tailwind |
| `tailwindcss-animate` | ^1.0.7 | Animações Tailwind |
| `vaul` | ^0.9.9 | Drawer/Sheet component |
| `zod` | ^3.25.76 | Validação de esquemas |

### Dependências de Desenvolvimento

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `@eslint/js` | ^9.32.0 | ESLint Core |
| `@tailwindcss/typography` | ^0.5.16 | Plugin de tipografia Tailwind |
| `@types/node` | ^22.16.5 | Tipos do Node.js |
| `@types/react` | ^18.3.23 | Tipos do React |
| `@types/react-dom` | ^18.3.7 | Tipos do React DOM |
| `@vitejs/plugin-react-swc` | ^3.11.0 | Plugin Vite para React com SWC |
| `autoprefixer` | ^10.4.21 | PostCSS Autoprefixer |
| `concurrently` | ^9.2.1 | Executar comandos simultaneamente |
| `eslint` | ^9.32.0 | Linter JavaScript |
| `eslint-plugin-react-hooks` | ^5.2.0 | Regras ESLint para React Hooks |
| `eslint-plugin-react-refresh` | ^0.4.20 | ESLint para Fast Refresh |
| `globals` | ^15.15.0 | Variáveis globais |
| `lovable-tagger` | ^1.1.13 | Lovable Tagger Plugin |
| `postcss` | ^8.5.6 | Processador CSS |
| `tailwindcss` | ^3.4.17 | Framework CSS |
| `typescript` | ^5.8.3 | TypeScript |
| `typescript-eslint` | ^8.38.0 | TypeScript ESLint |
| `vite` | ^5.4.19 | Build tool |

---

## ⚙️ Backend (Node.js)

**Diretório:** `/backend`  
**Gerenciador de Pacotes:** npm  
**Arquivo de configuração:** `backend/package.json`

### Dependências de Produção

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `axios` | ^1.6.0 | Cliente HTTP |
| `cheerio` | ^1.1.2 | Parser HTML (jQuery-like) |
| `node-cron` | ^3.0.3 | Agendador de tarefas |
| `puppeteer` | ^24.34.0 | Automação de browser (headless Chrome) |
| `rss-parser` | ^3.13.0 | Parser de feeds RSS |

> ⚠️ **Nota sobre Puppeteer:** O Puppeteer baixa automaticamente uma versão do Chromium durante a instalação (~300MB). Para ambientes de produção, considere usar `puppeteer-core` com um Chromium instalado separadamente.

---

## 🚀 Comandos de Instalação

### Instalação Completa (Local)
```bash
# Clonar o repositório
git clone <REPO_URL>
cd field-focus-board

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### Executar em Desenvolvimento
```bash
# Executa frontend e backend simultaneamente
npm run dev

# Ou separadamente:
npm run dev:frontend  # Apenas frontend (porta 5173)
npm run dev:backend   # Apenas backend
```

### Build para Produção
```bash
npm run build
```

---

## 🐳 Docker (Recomendado para Cloud)

### Dockerfile Exemplo
```dockerfile
FROM node:20-slim

# Instalar dependências do Puppeteer
RUN apt-get update && apt-get install -y \
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
  libgcc1 \
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
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar e instalar dependências
COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Copiar código fonte
COPY . .

# Build do frontend
RUN npm run build

# Expor porta
EXPOSE 5173

# Iniciar aplicação
CMD ["npm", "run", "dev"]
```

---

## ☁️ Considerações para Deploy em Nuvem

### AWS
- **EC2**: Use uma instância com pelo menos 2GB de RAM para o Puppeteer
- **ECS/Fargate**: Use a imagem Docker com as dependências do Chromium
- **Lambda**: Considere usar `chrome-aws-lambda` em vez do Puppeteer padrão

### Google Cloud Platform
- **Cloud Run**: Requer configuração especial para o Puppeteer
- **App Engine**: Use Flexible Environment para suporte ao Puppeteer

### Azure
- **App Service (Linux)**: Configure o container com as dependências necessárias
- **Container Instances**: Use a imagem Docker personalizada

### Heroku
- Adicione o buildpack: `heroku buildpacks:add jontewks/puppeteer`

### Variáveis de Ambiente Recomendadas
```bash
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true  # Se usar Chromium pré-instalado
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser  # Caminho do Chromium
```

---

## 📊 Resumo de Recursos

| Componente | Pacotes | Tamanho Aprox. (node_modules) |
|------------|---------|-------------------------------|
| Frontend | 51 dependências diretas | ~400MB |
| Backend | 5 dependências diretas | ~300MB (inclui Chromium) |
| **Total** | 56 dependências diretas | ~700MB |

---

*Documento gerado em: 30/12/2024*
