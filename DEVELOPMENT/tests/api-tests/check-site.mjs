#!/usr/bin/env node

console.log('🔍 === VERIFICACIÓN COMPLETA DE SITIO ===\n');

const checkSite = async () => {
  const siteUrl = 'https://dorodrig.github.io/proyectooxitrans/';
  
  console.log('🌐 URL del sitio:', siteUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    console.log('\n1. Verificando acceso al sitio principal...');
    const response = await fetch(siteUrl);
    
    console.log('📡 Status:', response.status, response.statusText);
    console.log('📋 Headers principales:');
    console.log('   Content-Type:', response.headers.get('content-type'));
    console.log('   Content-Length:', response.headers.get('content-length'));
    console.log('   Last-Modified:', response.headers.get('last-modified'));
    console.log('   ETag:', response.headers.get('etag'));
    
    if (response.ok) {
      const html = await response.text();
      
      console.log('\n2. Analizando contenido HTML...');
      console.log('📄 Tamaño del HTML:', html.length, 'caracteres');
      
      // Verificar que tenga los elementos críticos
      const hasRoot = html.includes('<div id="root"></div>');
      const hasScript = html.includes('type="module"') && html.includes('/assets/');
      const hasCSS = html.includes('rel="stylesheet"') && html.includes('/assets/');
      const hasTitle = html.includes('Control de Acceso - OXITRANS');
      
      console.log('✅ Elemento root:', hasRoot ? 'Presente' : '❌ FALTANTE');
      console.log('✅ Script módulo:', hasScript ? 'Presente' : '❌ FALTANTE');
      console.log('✅ CSS compilado:', hasCSS ? 'Presente' : '❌ FALTANTE');
      console.log('✅ Título correcto:', hasTitle ? 'Presente' : '❌ FALTANTE');
      
      if (hasRoot && hasScript && hasCSS && hasTitle) {
        console.log('\n🎉 ¡SITIO PARECE CORRECTO!');
        console.log('💡 Si sigue fallando, prueba:');
        console.log('   1. Ctrl+F5 para refrescar sin cache');
        console.log('   2. Modo incógnito');
        console.log('   3. Esperar 2-3 minutos más');
      } else {
        console.log('\n❌ PROBLEMA DETECTADO EN EL HTML');
      }
      
      // Mostrar una muestra del HTML
      console.log('\n📋 Muestra del HTML (primeros 500 caracteres):');
      console.log(html.substring(0, 500) + '...');
      
    } else {
      console.log('❌ Error al acceder al sitio');
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
};

await checkSite();

console.log('\n🏁 === FIN VERIFICACIÓN ===');
