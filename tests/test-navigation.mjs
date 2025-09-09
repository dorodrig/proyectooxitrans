#!/usr/bin/env node

console.log('🧭 === TEST DE NAVEGACIÓN Y RUTAS ===\n');

const testNavigation = async () => {
  const baseUrl = 'https://dorodrig.github.io/proyectooxitrans';
  
  const routesToTest = [
    '/',
    '/login',
    '/admin/usuarios',
    '/admin/regionales',
    '/dashboard'
  ];

  console.log('🎯 Probando rutas principales...\n');

  for (const route of routesToTest) {
    const url = `${baseUrl}${route}`;
    console.log(`📍 Probando: ${route}`);
    
    try {
      const response = await fetch(url, {
        method: 'HEAD', // Solo headers, no content
        redirect: 'follow'
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   URL final: ${response.url}`);
      
      if (response.status === 404) {
        console.log('   ❌ 404 - Ruta no encontrada');
      } else if (response.status === 200) {
        console.log('   ✅ Ruta accesible');
      } else {
        console.log(`   ⚠️  Status inesperado: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
};

const testSPAHandling = async () => {
  console.log('\n🔄 === PRUEBA DE MANEJO SPA ===\n');
  
  // Simular navegación directa a una ruta profunda
  const deepRoute = 'https://dorodrig.github.io/proyectooxitrans/admin/regionales';
  
  console.log('📍 Probando navegación directa a ruta profunda...');
  console.log(`   URL: ${deepRoute}`);
  
  try {
    const response = await fetch(deepRoute);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 200) {
      console.log('   ✅ SPA routing funcionando correctamente');
    } else {
      console.log('   ❌ Problema con SPA routing');
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
};

await testNavigation();
await testSPAHandling();

console.log('\n🏁 === RESUMEN ===');
console.log('✅ Todas las rutas deberían devolver status 200');
console.log('✅ GitHub Pages debería manejar las rutas SPA correctamente');
console.log('💡 Si ves 404, espera 2-3 minutos para que GitHub Pages se actualice');
