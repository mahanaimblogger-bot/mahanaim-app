// generate-report.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuración: qué archivos/carpetas incluir/excluir
const includeExtensions = ['.js', '.jsx', '.json', '.md', '.css', '.env.local', '.mjs'];
const excludeDirs = ['node_modules', '.next', 'out', 'dist', 'build', '.git', 'coverage', '.vercel'];

const outputFile = 'project-report.md';

function isExcluded(dir) {
  return excludeDirs.some(ex => dir.includes(ex) || dir === ex);
}

function readFilesRecursively(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relativePath = path.join(baseDir, file);
    if (stat.isDirectory()) {
      if (!isExcluded(file)) {
        results = results.concat(readFilesRecursively(filePath, relativePath));
      }
    } else {
      const ext = path.extname(file);
      if (includeExtensions.includes(ext) || file === '.env.local' || file === 'package.json') {
        results.push({
          path: relativePath,
          content: fs.readFileSync(filePath, 'utf8')
        });
      }
    }
  });
  return results;
}

function generateReport() {
  const projectRoot = process.cwd();
  console.log(`Generando reporte del proyecto en: ${projectRoot}`);
  
  // Obtener información de git
  let gitInfo = '';
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const lastCommit = execSync('git log -1 --format="%h - %s (%an, %ar)"', { encoding: 'utf8' }).trim();
    gitInfo = `- Rama actual: ${branch}\n- Último commit: ${lastCommit}`;
  } catch (e) {
    gitInfo = 'No se pudo obtener información de git (¿no es un repositorio?)';
  }

  // Leer package.json para versión y dependencias
  let packageJson = {};
  try {
    const pkg = fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8');
    packageJson = JSON.parse(pkg);
  } catch (e) {
    packageJson = { error: 'No se pudo leer package.json' };
  }

  // Leer archivos
  const files = readFilesRecursively(projectRoot);

  // Construir reporte
  let report = `# Reporte del proyecto Mahanaim\n\n`;
  report += `Generado el: ${new Date().toLocaleString()}\n\n`;
  report += `## Información de Git\n${gitInfo}\n\n`;
  report += `## Dependencias principales (package.json)\n`;
  report += `- Next.js: ${packageJson.dependencies?.next || 'No especificado'}\n`;
  report += `- React: ${packageJson.dependencies?.react || 'No especificado'}\n`;
  report += `- Supabase: ${packageJson.dependencies?.['@supabase/supabase-js'] || 'No especificado'}\n`;
  report += `- Otras: ${Object.keys(packageJson.dependencies || {}).filter(d => !['next', 'react', '@supabase/supabase-js'].includes(d)).join(', ') || 'Ninguna'}\n\n`;

  report += `## Archivos clave (contenido)\n\n`;
  
  // Priorizar archivos importantes
  const priorityFiles = [
    'app/linea-tiempo/TimelineAvanzado.jsx',
    'app/linea-tiempo/EventoCard.jsx',
    'app/lector/[slug]/chapter/page.js',
    'app/linea-tiempo/TimelineWrapper.jsx',
    'app/api/bible-verse/route.js',
    'lib/supabaseClient.js',
    'next.config.mjs',
    'package.json',
    'DOCUMENTACION_PROYECTO_MAHANAIM.md'
  ];

  // Primero los prioritarios
  priorityFiles.forEach(pf => {
    const found = files.find(f => f.path === pf || f.path.endsWith(pf));
    if (found) {
      report += `### ${found.path}\n\`\`\`${path.extname(found.path).slice(1) || 'txt'}\n${found.content}\n\`\`\`\n\n`;
    }
  });

  // Luego el resto (pero limitar para no hacer el reporte demasiado grande)
  const otherFiles = files.filter(f => !priorityFiles.some(pf => f.path === pf || f.path.endsWith(pf)));
  report += `### Otros archivos (${otherFiles.length} archivos)\n\n`;
  otherFiles.forEach(f => {
    report += `- ${f.path} (${f.content.length} caracteres)\n`;
  });
  report += `\n`;

  // Escribir archivo
  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`Reporte generado en ${outputFile}`);
}

generateReport();