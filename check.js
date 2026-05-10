const fs = require('fs');

// Read HTML and extract script
const html = fs.readFileSync('apps/real-estate/index.html', 'utf-8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);

if (!match) {
  console.error('✗ No script found');
  process.exit(1);
}

try {
  // Test syntax using new Function
  new Function(match[1]);
  console.log('✓ SUCCESS: JavaScript syntax is valid');
  const lines = match[1].split('\n').length;
  const chars = match[1].length;
  console.log(`  • ${chars} characters, ${lines} lines`);
} catch (e) {
  console.error('✗ FAILED: ' + e.message);
  process.exit(1);
}
