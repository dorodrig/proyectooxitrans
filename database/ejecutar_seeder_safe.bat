@echo off
echo ========================================
echo OXITRANS - SEEDER SEGURO JORNADAS LABORALES
echo ========================================
echo.

echo Ejecutando seeder con manejo de duplicados...
echo Esto ignorara registros duplicados en lugar de fallar.
echo.

cd /d "%~dp0"

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor instale Node.js desde https://nodejs.org
    pause
    exit /b 1
)

echo Ejecutando el seeder...
node run_seeder.js

echo.
echo Seeder completado.
echo Presione cualquier tecla para continuar...
pause >nul