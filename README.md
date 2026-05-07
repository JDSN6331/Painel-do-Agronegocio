# Painel do Agronegócio

Dashboard em tempo real para monitoramento de cotações, clima e notícias do agronegócio brasileiro, com foco especial na Cooxupé - maior cooperativa de café do mundo.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Painel+do+Agroneg%C3%B3cio)

## ✨ Funcionalidades

### 📊 Cotações em Tempo Real
- **Dólar** - Via AwesomeAPI (atualização em tempo real)
- **Café ICE NY** - Referência internacional (Bolsa de Nova York)
- **Café CEPEA/ESALQ** - Mercado físico brasileiro
- **Milho, Soja, Boi Gordo** - Indicadores CEPEA/ESALQ
- **Leite** - Preços ao produtor (Notícias Agrícolas)

### 🌤️ Clima
- Previsão para 6 cidades do Sul de Minas e São Paulo
- Temperatura, umidade e probabilidade de chuva
- Ícones dinâmicos de condição climática

### 📰 Notícias
- **7 categorias**: Cooxupé em Destaque, Defensivos, Fertilizantes, Máquinas/Irrigação, Grãos, Gado de Corte, Leite
- Coleta automática via Google News RSS
- Filtros de relevância e contexto brasileiro
- Atualização a cada 90 minutos

## 🛠️ Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express, Puppeteer |
| **APIs** | AwesomeAPI, CEPEA, ICE NY, Google News RSS, Open-Meteo |

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone <URL_DO_REPOSITORIO>
cd painel-agronegocio

# Instalar dependências
npm install

# Executar (frontend + backend simultaneamente)
npm run dev
```

O painel estará disponível em `http://localhost:8080`

## 📁 Estrutura do Projeto

```
├── backend/
│   ├── index.js          # Servidor Express e ciclos de coleta
│   ├── scraper.js        # Coleta de cotações
│   ├── weather.js        # Coleta de dados climáticos
│   └── news.js           # Coleta de notícias
├── public/
│   └── data/             # JSONs atualizados em tempo real
├── src/
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   └── pages/            # Páginas da aplicação
└── package.json
```

## ⏱️ Ciclos de Coleta

| Ciclo | Intervalo | Dados |
|-------|-----------|-------|
| **Rápido** | 5 min | Cotações + Clima |
| **Pesado** | 90 min | Notícias (7 categorias) |

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

Desenvolvido para a **Cooxupé** - Cooperativa Regional de Cafeicultores em Guaxupé Ltda.
