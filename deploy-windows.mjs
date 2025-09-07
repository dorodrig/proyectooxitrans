#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE DEPLOYMENT ALTERNATIVO PARA WINDOWS
 * Evita el error ENAMETOOLONG de gh-pages
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

console.log('🎯 OXITRANS - Deployment a GitHub Pages');
console.log('==========================================');

try {
  // 1. Verificar que existe el build
  if (!existsSync('./dist')) {
    console.log('📦 Generando build de producción...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  console.log('✅ Build encontrado en ./dist');

  // 2. Configurar git si es necesario
  console.log('🔧 Configurando Git...');
  
  try {
    execSync('git config user.name', { stdio: 'pipe' });
  } catch {
    execSync('git config user.name "OXITRANS Deploy Bot"', { stdio: 'inherit' });
  }

  try {
    execSync('git config user.email', { stdio: 'pipe' });
  } catch {
    execSync('git config user.email "deploy@oxitrans.com"', { stdio: 'inherit' });
  }

  // 3. Crear branch gh-pages si no existe
  console.log('🌿 Preparando branch gh-pages...');
  
  try {
    execSync('git show-ref --verify --quiet refs/heads/gh-pages', { stdio: 'pipe' });
    console.log('✅ Branch gh-pages existe');
  } catch {
    console.log('🆕 Creando branch gh-pages...');
    execSync('git checkout --orphan gh-pages', { stdio: 'inherit' });
    execSync('git rm -rf .', { stdio: 'inherit' });
    execSync('git clean -fxd', { stdio: 'inherit' });
    execSync('echo "# OXITRANS GitHub Pages" > README.md', { stdio: 'inherit' });
    execSync('git add README.md', { stdio: 'inherit' });
    execSync('git commit -m "Initial GitHub Pages commit"', { stdio: 'inherit' });
    execSync('git checkout main', { stdio: 'inherit' });
  }

  // 4. Hacer deployment
  console.log('🚀 Haciendo deployment...');
  
  execSync('git checkout gh-pages', { stdio: 'inherit' });
  execSync('git rm -rf . || true', { stdio: 'inherit' });
  execSync('git clean -fxd', { stdio: 'inherit' });
  execSync('cp -r dist/* . || xcopy "dist\\*" "." /E /H /Y', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Deploy: ' + new Date().toISOString() + '"', { stdio: 'inherit' });
  execSync('git push origin gh-pages --force', { stdio: 'inherit' });
  execSync('git checkout main', { stdio: 'inherit' });

  console.log('');
  console.log('🎉 ¡DEPLOYMENT EXITOSO!');
  console.log('🌐 Tu aplicación estará disponible en:');
  console.log('   https://dorodrig.github.io/proyectooxitrans');
  console.log('');
  console.log('⏰ Puede tomar algunos minutos en propagarse...');

} catch (error) {
  console.error('❌ Error durante el deployment:', error.message);
  console.log('');
  console.log('💡 Soluciones alternativas:');
  console.log('1. Usar GitHub Actions (ya configurado en .github/workflows/deploy.yml)');
  console.log('2. Hacer deployment manual desde GitHub web interface');
  console.log('3. Usar npm run deploy:github-actions');
  process.exit(1);
}
