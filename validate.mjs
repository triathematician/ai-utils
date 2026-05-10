import { readFileSync } from 'fs';

const html = readFileSync('apps/real-estate/index.html', 'utf-8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);

if (!match) {
  console.error('✗ FAILED: No script tag found');
  process.exit(1);
}

try {
  new Function(match[1]);
  const chars = match[1].length;
  const lines = match[1].split('\n').length;
  console.log('✓ SUCCESS: JavaScript syntax is valid');
  console.log(`  • ${chars} characters, ${lines} lines`);
  process.exit(0);
} catch (e) {
  console.error('✗ FAILED: ' + e.message);
  process.exit(1);
}
