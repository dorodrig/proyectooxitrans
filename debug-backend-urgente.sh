#!/bin/bash
echo "🔍 DIAGNÓSTICO URGENTE - ENCONTRANDO ERROR ESPECÍFICO DEL BACKEND"

cd /home/userEcs2/proyectooxitrans/server

echo "1️⃣ Estado actual de PM2:"
pm2 status

echo ""
echo "2️⃣ Logs de ERROR del backend (últimas 50 líneas):"
pm2 logs oxitrans-backend --err --lines 50 --nostream

echo ""
echo "3️⃣ Logs COMPLETOS del backend (últimas 30 líneas):"
pm2 logs oxitrans-backend --lines 30 --nostream

echo ""
echo "4️⃣ Probando login directamente en el servidor:"
curl -v -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@oxitrans.com", "password": "admin123"}' 2>&1

echo ""
echo "5️⃣ Verificando si el endpoint existe:"
curl -v http://localhost:3001/api/health 2>&1

echo ""
echo "6️⃣ Verificando conexión a base de datos desde el servidor:"
node -e "
const mysql = require('mysql2/promise');
const config = {
  host: 'database-oxitrans.cjokqqsqayan.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'oxitrans06092025*',
  database: 'control_acceso_oxitrans',
  port: 3306
};

mysql.createConnection(config)
  .then(conn => {
    console.log('✅ Conexión DB OK');
    return conn.execute('SELECT COUNT(*) as total FROM usuarios LIMIT 1');
  })
  .then(([rows]) => {
    console.log('✅ Query OK, usuarios encontrados:', rows[0].total);
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Error DB:', err.message);
    process.exit(1);
  });
" 2>&1

echo ""
echo "7️⃣ Reiniciando backend con logs en tiempo real:"
pm2 restart oxitrans-backend
echo "Esperando 3 segundos para logs..."
sleep 3
pm2 logs oxitrans-backend --lines 5 --nostream