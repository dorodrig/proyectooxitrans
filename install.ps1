# Script de Instalación - Sistema de Control de Acceso OXITRANS S.A.S

Write-Host "🚀 Instalando dependencias del Sistema de Control de Acceso OXITRANS S.A.S" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Yellow

# Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Green
npm install

# Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Green
Set-Location server
npm install
Set-Location ..

Write-Host "✅ Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configura tu base de datos MySQL" -ForegroundColor White
Write-Host "2. Ejecuta el script SQL en 'database/schema.sql'" -ForegroundColor White
Write-Host "3. Configura las variables de entorno en 'server/.env'" -ForegroundColor White
Write-Host "4. Ejecuta 'npm run dev:fullstack' para iniciar el desarrollo" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Variables de entorno requeridas:" -ForegroundColor Yellow
Write-Host "   - DB_HOST=localhost" -ForegroundColor Gray
Write-Host "   - DB_PORT=3306" -ForegroundColor Gray
Write-Host "   - DB_USER=tu_usuario" -ForegroundColor Gray
Write-Host "   - DB_PASSWORD=tu_contraseña" -ForegroundColor Gray
Write-Host "   - DB_NAME=control_acceso_oxitrans" -ForegroundColor Gray
Write-Host "   - JWT_SECRET=tu_jwt_secret_muy_seguro" -ForegroundColor Gray
