#!/bin/bash
echo "🔧 SOLUCIONANDO CONFIGURACIÓN PM2 - DEFINITIVO"

cd /home/userEcs2/proyectooxitrans/server

echo "1️⃣ Deteniendo PM2 actual..."
sudo pm2 stop all
sudo pm2 delete all

echo "2️⃣ Creando nueva configuración PM2 CORRECTA..."
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'oxitrans-backend',
    script: './dist/index.js',  // DIRECTO AL ARCHIVO JS, NO NPM
    cwd: '/home/userEcs2/proyectooxitrans/server',
    instances: 1,
    exec_mode: 'fork',  // CAMBIADO DE CLUSTER A FORK
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
EOF

echo "3️⃣ Iniciando con nueva configuración..."
sudo pm2 start ecosystem.config.cjs

echo "4️⃣ Verificando que funcione..."
sleep 3
sudo pm2 status
sudo pm2 logs --lines 10

echo ""
echo "5️⃣ Probando API endpoints..."
sleep 2
echo "Testing /api/health:"
curl -s http://localhost:3001/api/health || echo "❌ Error en health"

echo ""
echo "Testing /api/auth/login:"
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test", "password": "test"}' || echo "❌ Error en login"

echo ""
echo "6️⃣ Guardando PM2 para auto-restart..."
sudo pm2 save
sudo pm2 startup

echo ""
echo "🎉 ¡CONFIGURACIÓN COMPLETADA! El backend debería funcionar ahora."
echo "Prueba acceder a: http://ec2-18-218-166-209.us-east-2.compute.amazonaws.com/proyectooxitrans/login"