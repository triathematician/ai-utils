const fs = require('fs');
const path = require('path');

const DERIVED = path.join(__dirname, '../../derived/elections');

const newRows = JSON.parse(fs.readFileSync(path.join(__dirname, 'state_2000_2020.json')))
  .filter(r => r.year === 2000 || r.year === 2004);

const existingPath = path.join(DERIVED, 'results.json');
const existing = JSON.parse(fs.readFileSync(existingPath));

const combined = [...newRows, ...existing];
fs.writeFileSync(existingPath, JSON.stringify(combined) + '\n');
console.log(`${combined.length} total rows (added ${newRows.length} new)`);
