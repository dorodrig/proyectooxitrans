#!/bin/bash

# Script de deployment para EC2 - Single Server
# Frontend + Backend en la misma instancia

echo "🚀 OXITRANS - Deployment EC2 Single Server"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/var/www/oxitrans"
FRONTEND_PORT=5173
BACKEND_PORT=3001
NGINX_CONF="/etc/nginx/sites-available/oxitrans"

echo -e "${BLUE}📁 Directorio del proyecto: ${PROJECT_DIR}${NC}"

git pull origin main
set -e

# 1. Backup de base de datos antes de actualizar
echo -e "${YELLOW}🗄️  Realizando backup de base de datos...${NC}"
if [ -f server/.env ]; then
    source <(grep = server/.env | sed 's/^/export /')
    mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql || echo -e "${RED}⚠️  Backup fallido${NC}"
fi

# 2. Actualizar código desde Git
echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
cd $PROJECT_DIR
git pull origin main

# 2. Instalar dependencias Frontend
echo -e "${YELLOW}📦 Instalando dependencias Frontend...${NC}"
npm install

# 3. Instalar dependencias Backend
echo -e "${YELLOW}📦 Instalando dependencias Backend...${NC}"
cd server
npm install
cd ..

trap 'echo -e "${RED}❌ Error en el deployment. Ejecutando rollback...${NC}"; exit 1' ERR

# 4. Construir Frontend
echo -e "${YELLOW}🔨 Construyendo Frontend...${NC}"
npm run build || { echo -e "${RED}❌ Build frontend fallido${NC}"; exit 1; }

# 5. Construir Backend
echo -e "${YELLOW}🔨 Construyendo Backend...${NC}"
npm run build:server || { echo -e "${RED}❌ Build backend fallido${NC}"; exit 1; }

# 6. Configurar Nginx (si no existe)
if [ ! -f "$NGINX_CONF" ]; then
    echo -e "${YELLOW}⚙️  Configurando Nginx...${NC}"
    sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend - Servir archivos estáticos
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Headers para PWA
        add_header Service-Worker-Allowed "/";
        add_header Cache-Control "public, max-age=0, must-revalidate" always;
    }

    # Backend API - Proxy a Node.js
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root $PROJECT_DIR/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Habilitar sitio
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configurado${NC}"
fi

# 7. Configurar servicios systemd
echo -e "${YELLOW}⚙️  Configurando servicio Backend...${NC}"

# Backend service
sudo tee /etc/systemd/system/oxitrans-backend.service > /dev/null <<EOF
[Unit]
Description=OXITRANS Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$PROJECT_DIR/server
Environment=NODE_ENV=production
Environment=PORT=$BACKEND_PORT
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart oxitrans-backend || pm2 start server/ecosystem.config.js
else
    sudo systemctl daemon-reload
    sudo systemctl enable oxitrans-backend
    sudo systemctl restart oxitrans-backend
fi

# 9. Verificar estado
echo -e "${BLUE}📊 Estado de servicios:${NC}"
echo -e "${YELLOW}Backend:${NC}"
sudo systemctl status oxitrans-backend --no-pager -l

echo -e "${YELLOW}Nginx:${NC}"
sudo systemctl status nginx --no-pager -l

# 10. Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"
sleep 5

# Test backend
echo -e "${YELLOW}Testing backend health...${NC}"
curl -f http://localhost:$BACKEND_PORT/api/health || echo -e "${RED}❌ Backend test failed${NC}"

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
curl -f http://localhost/ || echo -e "${RED}❌ Frontend test failed${NC}"

echo -e "${GREEN}🎉 Deployment completado!${NC}"
echo -e "${BLUE}Frontend: http://your-ec2-ip/${NC}"
echo -e "${BLUE}Backend API: http://your-ec2-ip/api/${NC}"