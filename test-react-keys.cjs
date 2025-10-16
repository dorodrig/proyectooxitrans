// Prueba para detectar elementos sin keys en React
// Este script ayuda a identificar .map() calls sin key props

const fs = require('fs');
const path = require('path');

// Función para buscar archivos .tsx
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Función para buscar .map() sin key
function checkForMissingKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    // Buscar .map() calls
    if (line.includes('.map(') && line.includes('=>')) {
      // Buscar en las siguientes líneas si hay un key prop
      const nextFewLines = lines.slice(index, index + 10).join('\n');
      
      // Si contiene JSX pero no tiene key=
      if (nextFewLines.includes('<') && !nextFewLines.includes('key=')) {
        issues.push({
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    }
  });
  
  return issues;
}

// Ejecutar la prueba
console.log('🔍 Buscando problemas de React keys...\n');

const srcPath = path.join(__dirname, 'src');
const tsxFiles = findTsxFiles(srcPath);

let totalIssues = 0;

for (const file of tsxFiles) {
  const issues = checkForMissingKeys(file);
  if (issues.length > 0) {
    console.log(`❌ ${path.relative(__dirname, file)}:`);
    issues.forEach(issue => {
      console.log(`   Línea ${issue.line}: ${issue.content}`);
      totalIssues++;
    });
    console.log('');
  }
}

if (totalIssues === 0) {
  console.log('✅ No se encontraron issues obvios con React keys');
} else {
  console.log(`⚠️  Se encontraron ${totalIssues} posibles issues con React keys`);
}