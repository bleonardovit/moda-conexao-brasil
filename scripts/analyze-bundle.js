
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando análise do bundle...\n');

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

  // Show build size summary
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n📏 Resumo dos arquivos de build:');
    const files = fs.readdirSync(distPath, { withFileTypes: true });
    files
      .filter(dirent => dirent.isFile())
      .map(dirent => {
        const filePath = path.join(distPath, dirent.name);
        const stats = fs.statSync(filePath);
        return {
          name: dirent.name,
          size: (stats.size / 1024).toFixed(2) // KB
        };
      })
      .sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
      .slice(0, 10) // Top 10 largest files
      .forEach(file => {
        console.log(`  ${file.name.padEnd(30)} ${file.size.padStart(8)} KB`);
      });
  }

} catch (error) {
  console.error('❌ Erro durante análise:', error.message);
  process.exit(1);
}
