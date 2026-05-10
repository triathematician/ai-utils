const fs = require('fs');
const path = require('path');

try {
  // Read HTML
  const htmlPath = path.join(__dirname, 'apps/real-estate/index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  
  // Extract script
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error('No script tag found');
  
  const script = match[1];
  
  // Validate with new Function
  new Function(script);
  
  console.log('✓ SUCCESS: JavaScript syntax is valid');
  console.log(`  • ${script.length} characters`);
  console.log(`  • ${script.split('\n').length} lines`);
} catch (e) {
  console.error('✗ FAILED:');
  console.error('Error: ' + e.message);
  process.exit(1);
}
