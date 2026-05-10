import re
import sys

html_file = r'D:\code\ai-utils\apps\real-estate\index.html'

# Read HTML
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Extract script
match = re.search(r'<script>([\s\S]*?)</script>', html, re.DOTALL)
if not match:
    print('✗ FAILED: No script tag found')
    sys.exit(1)

script_text = match.group(1)
script_lines = script_text.split('\n')

print('=== JavaScript Validation Results ===\n')
print(f'Script size: {len(script_text)} characters')
print(f'Script lines: {len(script_lines)} lines')

# Basic syntax checks
errors = []

# Check brace balance
open_braces = script_text.count('{') - script_text.count(r'\{')
close_braces = script_text.count('}') - script_text.count(r'\}')

# Check for common syntax issues
checks = [
    ('Brace count', open_braces == close_braces, f'{open_braces} open vs {close_braces} close'),
    ('Paren count', script_text.count('(') == script_text.count(')'), 
     f'{script_text.count("(")} open vs {script_text.count(")")} close'),
]

print('\nBasic Checks:')
for check_name, result, detail in checks:
    status = '✓' if result else '✗'
    print(f'  {status} {check_name}: {detail}')
    if not result:
        errors.append(check_name)

# Check for unclosed strings (very basic)
single_quotes = script_text.count("'") - script_text.count("\\'")
double_quotes = script_text.count('"') - script_text.count('\\"')
backticks = script_text.count('`') - script_text.count('\\`')

quote_checks = [
    ('Single quotes', single_quotes % 2 == 0, f'{single_quotes} total'),
    ('Double quotes', double_quotes % 2 == 0, f'{double_quotes} total'),
    ('Backticks', backticks % 2 == 0, f'{backticks} total'),
]

print('\nString Delimiter Checks:')
for check_name, result, detail in quote_checks:
    status = '✓' if result else '✗'
    print(f'  {status} {check_name}: {detail}')
    if not result:
        errors.append(check_name)

if errors:
    print(f'\n✗ FAILED: {len(errors)} potential syntax issue(s) found')
    sys.exit(1)
else:
    print('\n✓ SUCCESS: No obvious JavaScript syntax errors detected')
    print('  (Basic structural validation only - use Node.js for full parsing)')
    sys.exit(0)
