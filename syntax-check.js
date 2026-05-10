const fs = require('fs');
const path = require('path');

try {
  const htmlFile = path.join(__dirname, 'apps', 'real-estate', 'index.html');
  const html = fs.readFileSync(htmlFile, 'utf8');
  
  const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>/gi;
  let match;
  let scriptCount = 0;
  let errorCount = 0;
  
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    const scriptTag = match[0];
    const scriptContent = scriptTag.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    
    if (!scriptContent) continue;
    
    try {
      new Function(scriptContent);
      console.log(`Script block ${scriptCount}: OK`);
    } catch (e) {
      errorCount++;
      console.error(`Script block ${scriptCount}: SYNTAX ERROR`);
      console.error(`  Error: ${e.message}`);
      console.error(`  First 100 chars: ${scriptContent.substring(0, 100)}`);
    }
  }
  
  console.log(`\nTotal inline scripts found: ${scriptCount}`);
  if (errorCount > 0) {
    console.log(`Syntax errors detected: ${errorCount}`);
    process.exit(1);
  } else {
    console.log('All inline scripts have valid syntax');
    process.exit(0);
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}
