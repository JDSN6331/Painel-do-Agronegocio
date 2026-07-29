# Guia de Deploy - AWS EC2 (Ubuntu)

Este guia contém todos os passos para fazer deploy da aplicação **Field Focus Board** em uma instância EC2 Ubuntu.

---

## 📋 Pré-requisitos na AWS

- Instância EC2 com **Ubuntu 22.04 LTS** ou superior
- Mínimo **2GB RAM** (recomendado para Puppeteer)
- **Porta 80** liberada no Security Group (HTTP)
- **Porta 22** liberada para SSH
- Chave SSH configurada para acesso

---

## 🚀 Script de Instalação Completa

Conecte via SSH na sua instância EC2 e execute os comandos abaixo:

### 1. Atualizar Sistema e Instalar Dependências Base

```bash
# Atualizar pacotes do sistema
sudo apt update && sudo apt upgrade -y

# Instalar Git
sudo apt install -y git

# Instalar dependências do Puppeteer/Chromium
sudo apt install -y \
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

### 2. Instalar Node.js 20 LTS

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### 3. Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela (começa com sudo env...)
```

### 4. Instalar e Configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Clonar o Repositório

```bash
# Criar diretório para aplicação
sudo mkdir -p /var/www
cd /var/www

# Clonar repositório do GitHub
sudo git clone https://github.com/JDSN6331/field-focus-board.git
cd field-focus-board

# Dar permissão ao usuário ubuntu
sudo chown -R ubuntu:ubuntu /var/www/field-focus-board
```

### 6. Instalar Dependências da Aplicação

```bash
cd /var/www/field-focus-board

# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### 7. Fazer Build do Frontend

```bash
cd /var/www/field-focus-board

# Gerar build de produção
npm run build
```

### 8. Configurar Nginx

```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/field-focus-board
```

Cole o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name _;  # Substitua pelo seu domínio ou IP

    # Diretório raiz (build do frontend)
    root /var/www/field-focus-board/dist;
    index index.html;

    # Servir arquivos estáticos do frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Servir arquivos JSON de dados (atualizados pelo backend)
    location /data/ {
        alias /var/www/field-focus-board/public/data/;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Logs
    access_log /var/log/nginx/field-focus-board.access.log;
    error_log /var/log/nginx/field-focus-board.error.log;
}
```

Salve (Ctrl+O, Enter) e saia (Ctrl+X).

```bash
# Habilitar o site
sudo ln -s /etc/nginx/sites-available/field-focus-board /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 9. Iniciar Backend com PM2

```bash
cd /var/www/field-focus-board

# Iniciar o backend
pm2 start backend/index.js --name "field-focus-backend"

# Salvar configuração do PM2
pm2 save

# Ver status
pm2 status
```

---

## ✅ Verificação

1. **Verificar se o backend está rodando:**
   ```bash
   pm2 status
   pm2 logs field-focus-backend
   ```

2. **Verificar se os JSONs estão sendo gerados:**
   ```bash
   ls -la /var/www/field-focus-board/public/data/
   ```

3. **Acessar a aplicação:**
   - Abra o navegador e acesse: `http://SEU_IP_PUBLICO_EC2`

---

## 🔄 Comandos Úteis

### Gerenciar Backend (PM2)

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs field-focus-backend

# Reiniciar backend
pm2 restart field-focus-backend

# Parar backend
pm2 stop field-focus-backend
```

### Gerenciar Nginx

```bash
# Status
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recarregar configuração
sudo systemctl reload nginx
```

### Atualizar Aplicação (Pull do GitHub)

```bash
cd /var/www/field-focus-board

# Puxar atualizações
git pull origin main

# Reinstalar dependências se necessário
npm install
cd backend && npm install && cd ..

# Rebuild do frontend
npm run build

# Reiniciar backend
pm2 restart field-focus-backend

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Opcional: Configurar HTTPS com Certbot

Se você tiver um domínio apontando para sua EC2:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua pelo seu domínio)
sudo certbot --nginx -d seu-dominio.com

# O Certbot configura renovação automática
```

---

## 📊 Arquitetura Final

```
                    Internet
                        │
                        ▼
              ┌─────────────────┐
              │   AWS EC2       │
              │   (Ubuntu)      │
              │                 │
              │  ┌───────────┐  │
              │  │   NGINX   │◄─┼─── Porta 80/443
              │  │  (proxy)  │  │
              │  └─────┬─────┘  │
              │        │        │
              │   ┌────┴────┐   │
              │   ▼         ▼   │
              │ /dist    /data  │
              │ (React)  (JSON) │
              │              ▲  │
              │              │  │
              │  ┌───────────┴┐ │
              │  │    PM2     │ │
              │  │ (backend)  │ │
              │  │            │ │
              │  │ Coleta a   │ │
              │  │ cada 5min  │ │
              │  └────────────┘ │
              └─────────────────┘
```

---

## ⚠️ Troubleshooting

### Puppeteer não funciona
```bash
# Verificar se Chromium pode rodar
node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(b => { console.log('OK'); b.close(); })"
```

### Erro de permissão nos arquivos JSON
```bash
sudo chown -R ubuntu:ubuntu /var/www/field-focus-board/public/data/
chmod 755 /var/www/field-focus-board/public/data/
```

### Backend não gera JSONs
```bash
# Ver logs do PM2
pm2 logs field-focus-backend --lines 100
```

---

*Guia criado em: 30/12/2024*
*Repositório: https://github.com/JDSN6331/field-focus-board*
