# 🚀 DEPLOYMENT EC2 - OXITRANS Single Server

## 📋 **Configuración Objetivo**

**Architecture**: Frontend + Backend en la misma instancia EC2
- **Frontend**: Archivos estáticos servidos por Nginx (Puerto 80)
- **Backend**: Node.js API (Puerto 3001) 
- **Proxy**: Nginx redirige `/api/*` al backend
- **Base de datos**: MySQL en la misma instancia o RDS

## 🛠️ **Pre-requisitos EC2**

### 1. **Instancia EC2**
```bash
# Ubuntu 22.04 LTS
# t3.medium o superior recomendado
# Security Group: HTTP (80), HTTPS (443), SSH (22)
```

### 2. **Instalación de dependencias**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt install nginx -y

# MySQL (opcional, si no usa RDS)
sudo apt install mysql-server -y

# PM2 para gestión de procesos
sudo npm install -g pm2

# Git
sudo apt install git -y
```

## 🚀 **Deployment Steps**

### 1. **Clonar proyecto**
```bash
cd /var/www
sudo git clone https://github.com/dorodrig/proyectooxitrans.git oxitrans
sudo chown -R ubuntu:ubuntu oxitrans
cd oxitrans
```

### 2. **Configurar variables de entorno**
```bash
# Backend
cp server/.env.example server/.env
# Editar server/.env con credenciales de BD y configuración

# Frontend (ya configurado en .env.production)
```

### 3. **Deployment automático**
```bash
npm run ec2:deploy
```

O manual:
```bash
# Instalar dependencias
npm install
cd server && npm install && cd ..

# Build
npm run ec2:build

# Configurar servicios (ver deploy-ec2.sh)
```

## 🔧 **Configuración Nginx**

El script automático crea:
```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/oxitrans/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 **Servicios Systemd**

### Backend Service
```bash
sudo systemctl status oxitrans-backend
sudo systemctl restart oxitrans-backend
sudo journalctl -u oxitrans-backend -f
```

## 🧪 **Testing**

### Health Checks
```bash
# Backend directo
curl http://localhost:3001/api/health

# A través de Nginx
curl http://localhost/api/health

# Frontend
curl http://localhost/
```

### Logs
```bash
# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Backend
sudo journalctl -u oxitrans-backend -f
```

## 🔄 **Updates**

```bash
cd /var/www/oxitrans
git pull origin main
npm run ec2:deploy
```

## 📱 **PWA Considerations**

- Service Worker funciona automáticamente
- HTTPS recomendado para PWA completa (usar Certbot)
- Iconos y manifest servidos correctamente

## 🔒 **Seguridad**

### SSL/HTTPS (Recomendado)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Firewall
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp  
sudo ufw allow 443/tcp
```

## 📈 **Monitoring**

### PM2 (Alternativa al systemd)
```bash
pm2 start server/dist/index.js --name oxitrans-backend
pm2 save
pm2 startup
```

### Logs centralizados
```bash
pm2 logs oxitrans-backend
```

## 🆘 **Troubleshooting**

### Common Issues
1. **CORS**: Verificar origins en backend
2. **404 API**: Verificar proxy Nginx
3. **Build fails**: Verificar Node.js version
4. **DB Connection**: Verificar credentials en .env

### Debug Commands
```bash
# Test backend directo
curl -v http://localhost:3001/api/health

# Test Nginx config
sudo nginx -t

# Check processes
sudo netstat -tlnp | grep :3001
sudo netstat -tlnp | grep :80
```