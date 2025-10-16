// Script mejorado para detectar React key issues
const fs = require('fs');
const path = require('path');

function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Buscar líneas que contengan .map( y =>
    if (line.includes('.map(') && (line.includes('=>') || lines[i + 1]?.includes('=>'))) {
      // Obtener las siguientes 10 líneas para análisis
      const followingLines = lines.slice(i, i + 10);
      const blockContent = followingLines.join('\n');
      
      // Verificar si hay JSX (elementos que empiecen con <)
      const hasJSX = blockContent.match(/<\s*[A-Z][A-Za-z0-9]*|<\s*[a-z]/);
      
      if (hasJSX) {
        // Buscar si hay key= en el bloque
        const hasKey = blockContent.includes('key=');
        
        if (!hasKey) {
          // Buscar el elemento JSX específico
          const jsxMatch = blockContent.match(/<\s*([A-Za-z][A-Za-z0-9]*)/);
          const elementName = jsxMatch ? jsxMatch[1] : 'elemento';
          
          issues.push({
            file: filePath,
            line: i + 1,
            content: line.trim(),
            element: elementName,
            severity: 'high'
          });
        }
      }
    }
  }
  
  return issues;
}

console.log('🔍 Análisis avanzado de React keys...\n');

const srcPath = path.join(__dirname, 'src');
const tsxFiles = findTsxFiles(srcPath);

const allIssues = [];

for (const file of tsxFiles) {
  const issues = analyzeFile(file);
  allIssues.push(...issues);
}

if (allIssues.length === 0) {
  console.log('✅ No se encontraron problemas evidentes con React keys');
} else {
  console.log(`❌ Se encontraron ${allIssues.length} posibles problemas:\n`);
  
  allIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${path.relative(__dirname, issue.file)}`);
    console.log(`   Línea ${issue.line}: ${issue.content}`);
    console.log(`   Elemento JSX: <${issue.element}>`);
    console.log(`   Severidad: ${issue.severity}\n`);
  });
}