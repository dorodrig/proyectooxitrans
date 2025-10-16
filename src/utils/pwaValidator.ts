// PWA Validation Checklist
// Este script verifica los requisitos básicos de PWA

console.log('🔍 Validando configuración PWA...\n');

const checks = [
  {
    name: 'Service Worker',
    check: () => 'serviceWorker' in navigator,
    description: 'Verifica soporte para Service Workers'
  },
  {
    name: 'Manifest',
    check: async () => {
      try {
        const response = await fetch('/manifest.webmanifest');
        const manifest = await response.json();
        return manifest.name && manifest.short_name && manifest.icons && manifest.icons.length > 0;
      } catch {
        return false;
      }
    },
    description: 'Verifica manifest válido con iconos'
  },
  {
    name: 'HTTPS/Localhost',
    check: () => location.protocol === 'https:' || location.hostname === 'localhost',
    description: 'Verifica que la app esté servida por HTTPS o localhost'
  },
  {
    name: 'Icons 192x192 y 512x512',
    check: async () => {
      try {
        const [icon192, icon512] = await Promise.all([
          fetch('/pwa-192x192.png'),
          fetch('/pwa-512x512.png')
        ]);
        return icon192.ok && icon512.ok;
      } catch {
        return false;
      }
    },
    description: 'Verifica iconos PWA requeridos'
  },
  {
    name: 'Viewport Meta Tag',
    check: () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      return viewport && viewport.getAttribute('content')?.includes('width=device-width') || false;
    },
    description: 'Verifica meta tag viewport responsivo'
  },
  {
    name: 'Theme Color',
    check: () => !!document.querySelector('meta[name="theme-color"]'),
    description: 'Verifica meta tag theme-color'
  }
];

async function validatePWA() {
  console.log('📱 OXITRANS - Validación PWA\n');
  console.log('='.repeat(50));
  
  let passedChecks = 0;
  const totalChecks = checks.length;
  
  for (const check of checks) {
    try {
      const result = await check.check();
      const status = result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${check.name}`);
      console.log(`   └─ ${check.description}`);
      
      if (result) passedChecks++;
    } catch (error) {
      console.log(`❌ FAIL ${check.name}`);
      console.log(`   └─ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultado: ${passedChecks}/${totalChecks} checks pasados`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 ¡PWA completamente funcional!');
    console.log('📱 La aplicación puede ser instalada en dispositivos móviles y de escritorio');
  } else {
    console.log('⚠️  Algunos checks fallaron. Revisar implementación PWA.');
  }
  
  // Información adicional
  console.log('\n📋 Información adicional:');
  console.log(`- URL actual: ${location.href}`);
  console.log(`- User Agent: ${navigator.userAgent.substring(0, 50)}...`);
  console.log(`- Soporte PWA: ${isPWASupported() ? 'Sí' : 'No'}`);
  console.log(`- App instalada: ${isAppInstalled() ? 'Sí' : 'No'}`);
}

// Funciones de utilidad
function isPWASupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         (window.navigator as any).standalone === true;
}

// Ejecutar validación automáticamente si está en el browser
if (typeof window !== 'undefined') {
  // Esperar a que la página cargue completamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validatePWA);
  } else {
    validatePWA();
  }
}

export default validatePWA;