#!/usr/bin/env python3
import re
import subprocess
import sys
import tempfile
import os

html_file = r'D:\code\ai-utils\apps\real-estate\index.html'

try:
    # Read the HTML file
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Extract script content
    match = re.search(r'<script>([\s\S]*?)</script>', html_content, re.DOTALL)
    
    if not match or not match.group(1):
        print('✗ FAILED: No script tag found in HTML')
        sys.exit(1)
    
    script_content = match.group(1)
    
    # Write to a temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(script_content)
        temp_path = f.name
    
    try:
        # Use Node.js to check syntax
        result = subprocess.run(['node', '--check', temp_path], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print('✓ SUCCESS: JavaScript syntax is valid')
            print(f'  • Script length: {len(script_content)} characters')
            print(f'  • Lines: {len(script_content.splitlines())}')
            sys.exit(0)
        else:
            print('✗ FAILED: JavaScript syntax error detected')
            print(f'\nError output:\n{result.stderr}')
            sys.exit(1)
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

except Exception as e:
    print(f'✗ FAILED: {str(e)}')
    sys.exit(1)
