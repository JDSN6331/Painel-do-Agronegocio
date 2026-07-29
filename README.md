# Painel do Agronegócio

Plataforma em tempo real para monitoramento de cotações, clima, notícias e **Artigos & Análises do Agronegócio**, com dados atualizados e foco no produtor rural e na cafeicultura brasileira (Cooxupé).

---

## ✨ Funcionalidades

### 📰 Artigos & Análises do Agronegócio
- **Conteúdo Técnico Autoral**: Artigos completos sobre gestão de custos na soja, irrigação inteligente, manejo integrado de pragas (MIP), cafeicultura, pecuária de corte e leiteira, drones/IA, nutrição de solo e bioinsumos.
- **Leitura Detalhada por Slug**: Roteamento dinâmico (`/artigos/:slug`) com visualização de artigos completos, data de publicação, autor e tempo de leitura.
- **Recomendações por Categoria**: Seção de artigos relacionados inteligente, priorizando publicações da mesma categoria.
- **Compartilhamento Flexível**: Botão de compartilhamento com suporte nativo e fallback automático de cópia de link compatível com ambientes HTTP/HTTPS.
- **Assets 100% Locais**: Imagens de alta definição salvas localmente em `public/images/articles/` para garantir funcionamento offline e imunidade a bloqueadores de anúncios (AdBlock).

### 📊 Cotações em Tempo Real
- **Dólar Comercial** — Atualização ao vivo via AwesomeAPI.
- **Café ICE NY** — Referência internacional (Bolsa de Nova York).
- **Café CEPEA/ESALQ** — Mercado físico brasileiro.
- **Milho, Soja, Boi Gordo** — Indicadores CEPEA/ESALQ.
- **Leite** — Preços ao produtor.

### 🌤️ Clima e Meteorologia
- Previsão do tempo para municípios do Sul de Minas e São Paulo via Open-Meteo.
- Temperatura, umidade e probabilidade de chuva com ícones dinâmicos.

### 📰 Notícias em Destaque
- Painéis divididos por categorias (Cooxupé em Destaque, Inovação, Defensivos, Fertilizantes, Máquinas, Grãos, Pecuária).
- Atualização em segundo plano via backend Node.js.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React, React Router DOM |
| **Backend** | Node.js, Express, Puppeteer (Web Scraping), RSS Parser |
| **Armazenamento de Mídia** | Assets locais estáticos em `/public/images/` (offline-first) |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18.x ou superior (Recomendado: v20 LTS)
- **npm**: v9.x ou v10.x

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd Painel-do-Agronegocio-main

# 2. Instalar as dependências do projeto
npm install

# 3. Executar o projeto (Frontend Vite + Backend Node simultaneamente)
npm run dev
```

A aplicação estará acessível localmente em `http://localhost:5173` ou `http://<IP_LOCAL>:8085`.

---

## 📁 Estrutura de Diretórios

```
├── backend/
│   ├── index.js          # Servidor Express e orquestrador de atualizações
│   ├── scraper.js        # Coleta de cotações agrícolas
│   ├── weather.js        # Coleta de dados meteorológicos
│   └── news.js           # Coleta de RSS de notícias
├── public/
│   ├── data/             # Arquivos JSON atualizados em tempo real (quotes, weather, news)
│   └── images/
│       ├── articles/     # Imagens locais dos artigos (article-1.jpg ... article-16.jpg)
│       └── fallbacks/    # Imagens locais de reserva (default-agro.jpg, cooxupe.jpg, inovacao.jpg)
├── src/
│   ├── components/       # Componentes de interface (Header, Footer, NewsCard, etc.)
│   ├── data/             # Dados estáticos e artigos (articlesData.ts)
│   ├── hooks/            # Hooks customizados React (useDataUpdates, toast)
│   ├── pages/            # Páginas (Index, Artigos, ArtigoDetalhe, Calculadoras, etc.)
│   ├── App.tsx           # Roteamento e Providers principais
│   └── main.tsx          # Ponto de entrada React
├── DEPENDENCIES.md       # Documentação detalhada de dependências do sistema
├── REQUIREMENTS.md       # Requisitos de sistema e ambiente
└── package.json
```

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.
Desenvolvido para a **Cooxupé** — Cooperativa Regional de Cafeicultores em Guaxupé Ltda.
