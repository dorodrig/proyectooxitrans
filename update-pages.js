const fs = require('fs');
const path = require('path');

const pages = [
  'AlertasPage.tsx',
  'ConfiguracionPage.tsx'
];

const srcPath = 'c:/Development/oxitrans-control-acceso/src/pages';

pages.forEach(pageName => {
  const filePath = path.join(srcPath, pageName);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add NavigationBar import
    if (!content.includes("import NavigationBar from '../components/common/NavigationBar';")) {
      content = content.replace(
        "import OverviewCardNew from '../components/dashboard/OverviewCardNew';",
        "import NavigationBar from '../components/common/NavigationBar';\nimport OverviewCardNew from '../components/dashboard/OverviewCardNew';"
      );
    }
    
    // Replace page title section with NavigationBar
    const titleRegex = /\{\/\* Page Title \*\/\}[\s\S]*?<\/div>\s*\{\/\* Stats Cards \*\/\}/;
    
    let pageTitle = '';
    if (pageName.includes('Alertas')) pageTitle = 'Centro de Alertas';
    else if (pageName.includes('Configuracion')) pageTitle = 'Configuración del Sistema';
    
    const replacement = `{/* Navigation Bar */}
          <NavigationBar title="${pageTitle}" />

          {/* Stats Cards */}`;
    
    content = content.replace(titleRegex, replacement);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${pageName}`);
    
  } catch (error) {
    console.log(`❌ Error updating ${pageName}:`, error.message);
  }
});

console.log('🎉 All pages updated successfully!');
