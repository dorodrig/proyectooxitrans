// Test del manifest.json
// Ejecutar en la consola del navegador para validar PWA

async function testManifest() {
  console.log('🔍 Testing PWA Manifest...\n');
  
  try {
    // Test 1: Fetch del manifest
    const response = await fetch('/manifest.json');
    console.log('✅ Manifest fetch status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Test 2: Parse JSON
    const manifest = await response.json();
    console.log('✅ Manifest JSON parsed successfully');
    console.log('📋 Manifest content:', manifest);
    
    // Test 3: Validar campos requeridos
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }
    
    // Test 4: Validar iconos
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`✅ Found ${manifest.icons.length} icons`);
      manifest.icons.forEach((icon, index) => {
        console.log(`   Icon ${index + 1}: ${icon.sizes} - ${icon.src}`);
      });
    } else {
      console.log('❌ No icons found in manifest');
    }
    
    // Test 5: Browser PWA support
    const pwaSupported = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
    console.log('📱 PWA Installation support:', pwaSupported ? '✅ Yes' : '❌ No');
    
    // Test 6: Check if running as PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    console.log('🚀 Running as installed PWA:', isInstalled ? '✅ Yes' : '❌ No');
    
    console.log('\n🎉 Manifest test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Manifest test failed:', error);
    return false;
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  testManifest();
}

export default testManifest;