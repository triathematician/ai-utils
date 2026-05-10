const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'apps/real-estate/index.html');

try {
  // Read the HTML file
  const html = fs.readFileSync(htmlFile, 'utf-8');
  
  // Extract script content between <script> and </script>
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  
  if (!match || !match[1]) {
    console.error('✗ FAILED: No script tag found in HTML');
    process.exit(1);
  }
  
  const scriptContent = match[1];
  
  // Try to parse the script content
  try {
    // Using new Function to validate syntax only (doesn't execute)
    new Function(scriptContent);
    console.log('✓ SUCCESS: JavaScript syntax is valid');
    console.log(`  • Script length: ${scriptContent.length} characters`);
    console.log(`  • Lines: ${scriptContent.split('\n').length}`);
    process.exit(0);
  } catch (syntaxError) {
    console.error('✗ FAILED: JavaScript syntax error detected');
    console.error(`\nError: ${syntaxError.message}`);
    console.error(`\nDetails:`);
    console.error(syntaxError);
    process.exit(1);
  }
} catch (err) {
  console.error('✗ FAILED: Error reading HTML file');
  console.error(err.message);
  process.exit(1);
}
