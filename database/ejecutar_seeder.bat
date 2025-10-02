@echo off
echo ============================================
echo  OXITRANS S.A.S - Seeder Jornadas Laborales
echo ============================================
echo.

echo Ejecutando datos de prueba para JornadaLaboralPage.tsx...
echo.

cd /d "C:\Development\oxitrans-control-acceso\database"

echo Verificando archivo de entorno...
if not exist "../server/.env" (
    echo ❌ Error: Archivo .env no encontrado en ../server/
    echo Asegurate de tener configurado el archivo .env en la carpeta server
    pause
    exit /b 1
)

echo ✅ Archivo .env encontrado
echo.

echo Ejecutando seeder...
node run_seeder.js

echo.
echo ============================================
echo  Proceso completado
echo ============================================
pause