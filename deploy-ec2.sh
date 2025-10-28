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

# Configurar manejo de errores
set -e
trap 'echo -e "${RED}❌ Error en el deployment. Saliendo...${NC}"; exit 1' ERR

echo -e "${BLUE}📁 Directorio del proyecto: ${PROJECT_DIR}${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Directorio del proyecto no existe: ${PROJECT_DIR}${NC}"
    exit 1
fi

cd $PROJECT_DIR

# 1. Actualizar código desde Git
echo -e "${YELLOW}📥 Actualizando código desde Git...${NC}"
git pull origin main || { echo -e "${YELLOW}⚠️  Git pull falló, continuando...${NC}"; }

# 2. Backup de base de datos (opcional)
echo -e "${YELLOW}🗄️  Realizando backup de base de datos...${NC}"
if [ -f server/.env ]; then
    source server/.env 2>/dev/null || true
    if [ ! -z "$DB_USER" ] && [ ! -z "$DB_PASSWORD" ] && [ ! -z "$DB_NAME" ]; then
        mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > backup_$(date +%Y%m%d_%H%M%S).sql 2>/dev/null || echo -e "${YELLOW}⚠️  Backup de BD falló, continuando...${NC}"
    fi
fi

# 3. Instalar dependencias Frontend
echo -e "${YELLOW}📦 Instalando dependencias Frontend...${NC}"
npm install || { echo -e "${RED}❌ npm install frontend fallido${NC}"; exit 1; }

# 4. Instalar dependencias Backend
echo -e "${YELLOW}📦 Instalando dependencias Backend...${NC}"
cd server
npm install || { echo -e "${RED}❌ npm install backend fallido${NC}"; exit 1; }
cd ..

# 5. Construir Frontend
echo -e "${YELLOW}🔨 Construyendo Frontend...${NC}"
NODE_ENV=production npx vite build --config vite.config.production.ts || { echo -e "${RED}❌ Build frontend fallido${NC}"; exit 1; }

# 6. Construir Backend
echo -e "${YELLOW}🔨 Construyendo Backend...${NC}"
npm run build:server || { echo -e "${RED}❌ Build backend fallido${NC}"; exit 1; }

# Verificar que los builds se crearon correctamente
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build frontend no generó carpeta dist/${NC}"
    exit 1
fi

if [ ! -d "server/dist" ]; then
    echo -e "${RED}❌ Build backend no generó carpeta server/dist/${NC}"
    exit 1
fi

# 7. Configurar Nginx
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

# Remover sitio por defecto de Nginx
sudo rm -f /etc/nginx/sites-enabled/default

# Habilitar sitio
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t || { echo -e "${RED}❌ Configuración de Nginx inválida${NC}"; exit 1; }
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx configurado${NC}"

# 8. Configurar y iniciar servicios del backend
echo -e "${YELLOW}⚙️  Configurando servicio Backend...${NC}"

# Crear directorio de logs si no existe
mkdir -p $PROJECT_DIR/server/logs

# Preferir PM2 si está disponible
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}Usando PM2 para el backend${NC}"
    cd $PROJECT_DIR/server
    pm2 stop oxitrans-backend 2>/dev/null || true
    pm2 start ecosystem.config.js || { echo -e "${RED}❌ PM2 start fallido${NC}"; exit 1; }
    pm2 save
    pm2 startup
    cd ..
else
    echo -e "${BLUE}Usando systemd para el backend${NC}"
    # Backend service para systemd
    sudo tee /etc/systemd/system/oxitrans-backend.service > /dev/null <<EOF
[Unit]
Description=OXITRANS Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/server
Environment=NODE_ENV=production
Environment=PORT=$BACKEND_PORT
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable oxitrans-backend
    sudo systemctl restart oxitrans-backend
fi

echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
sudo systemctl restart nginx

# 9. Verificar estado de servicios
echo -e "${BLUE}📊 Estado de servicios:${NC}"
sleep 3

if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}Backend (PM2):${NC}"
    pm2 status
    pm2 logs oxitrans-backend --lines 5 || true
else
    echo -e "${YELLOW}Backend (systemd):${NC}"
    sudo systemctl status oxitrans-backend --no-pager -l || true
fi

echo -e "${YELLOW}Nginx:${NC}"
sudo systemctl status nginx --no-pager -l || true

# 10. Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"
sleep 5

# Obtener IP pública de la instancia
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "tu-ec2-ip")

# Test backend directo
echo -e "${YELLOW}Testing backend health (directo)...${NC}"
curl -f http://localhost:$BACKEND_PORT/api/health 2>/dev/null && echo -e "${GREEN}✅ Backend OK${NC}" || echo -e "${RED}❌ Backend test failed${NC}"

# Test frontend a través de Nginx
echo -e "${YELLOW}Testing frontend (nginx)...${NC}"
curl -f http://localhost/ 2>/dev/null && echo -e "${GREEN}✅ Frontend OK${NC}" || echo -e "${RED}❌ Frontend test failed${NC}"

# Test API a través de Nginx
echo -e "${YELLOW}Testing API (nginx proxy)...${NC}"
curl -f http://localhost/api/health 2>/dev/null && echo -e "${GREEN}✅ API Proxy OK${NC}" || echo -e "${RED}❌ API proxy failed${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment completado!${NC}"
echo -e "${BLUE}Accede a tu aplicación en:${NC}"
echo -e "${BLUE}Frontend: http://${PUBLIC_IP}/${NC}"
echo -e "${BLUE}Backend API: http://${PUBLIC_IP}/api/health${NC}"
echo ""
echo -e "${YELLOW}Para ver logs del backend:${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}pm2 logs oxitrans-backend${NC}"
else
    echo -e "${BLUE}sudo journalctl -u oxitrans-backend -f${NC}"
fi