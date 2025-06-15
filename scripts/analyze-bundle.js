
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando análise avançada do bundle...\n');

try {
  // Build with analyzer
  console.log('📦 Construindo aplicação para análise...');
  execSync('npm run build -- --mode=analyze', { stdio: 'inherit' });

  // Check if stats.html was generated
  const statsPath = path.join(process.cwd(), 'dist', 'stats.html');
  if (fs.existsSync(statsPath)) {
    console.log('\n✅ Análise concluída!');
    console.log(`📊 Relatório disponível em: ${statsPath}`);
    console.log('🌐 O arquivo será aberto automaticamente no navegador.');
  } else {
    console.log('\n⚠️  Arquivo de análise não encontrado.');
  }

  // Enhanced build size analysis
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n📏 Análise detalhada dos arquivos:');
    
    const analyzeDirectory = (dirPath, prefix = '') => {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      const results = [];
      
      files.forEach(dirent => {
        const fullPath = path.join(dirPath, dirent.name);
        
        if (dirent.isDirectory()) {
          results.push(...analyzeDirectory(fullPath, `${prefix}${dirent.name}/`));
        } else if (dirent.isFile()) {
          const stats = fs.statSync(fullPath);
          const sizeKB = (stats.size / 1024);
          results.push({
            name: `${prefix}${dirent.name}`,
            size: sizeKB,
            type: dirent.name.endsWith('.js') ? 'JS' : 
                  dirent.name.endsWith('.css') ? 'CSS' : 
                  dirent.name.endsWith('.html') ? 'HTML' : 'OTHER'
          });
        }
      });
      
      return results;
    };

    const allFiles = analyzeDirectory(distPath);
    
    // Group by type
    const byType = allFiles.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || []).concat(file);
      return acc;
    }, {});

    // Show largest files by type
    Object.keys(byType).forEach(type => {
      console.log(`\n📁 ${type} Files:`);
      byType[type]
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .forEach(file => {
          const sizeStr = file.size > 1024 ? 
            `${(file.size / 1024).toFixed(2)} MB` : 
            `${file.size.toFixed(2)} KB`;
          console.log(`  ${file.name.padEnd(40)} ${sizeStr.padStart(10)}`);
        });
    });

    // Calculate totals
    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
    const totalSizeStr = totalSize > 1024 ? 
      `${(totalSize / 1024).toFixed(2)} MB` : 
      `${totalSize.toFixed(2)} KB`;
    
    console.log(`\n📊 Tamanho total: ${totalSizeStr}`);
    
    // Performance recommendations
    console.log('\n💡 Recomendações de Performance:');
    const jsFiles = byType.JS || [];
    const largeJS = jsFiles.filter(f => f.size > 100);
    
    if (largeJS.length > 0) {
      console.log('  ⚠️  Arquivos JS grandes encontrados (>100KB):');
      largeJS.forEach(file => {
        console.log(`    - ${file.name}: ${file.size.toFixed(2)}KB`);
      });
      console.log('  💡 Considere implementar code splitting adicional');
    }
    
    if (totalSize > 2048) { // 2MB
      console.log('  ⚠️  Bundle total muito grande (>2MB)');
      console.log('  💡 Considere lazy loading de mais componentes');
    } else {
      console.log('  ✅ Tamanho do bundle dentro dos limites recomendados');
    }
  }

} catch (error) {
  console.error('❌ Erro durante análise:', error.message);
  process.exit(1);
}
