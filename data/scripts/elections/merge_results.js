const fs = require('fs');
const path = require('path');

const newRows = JSON.parse(fs.readFileSync('state_2000_2020.json'))
  .filter(r => r.year === 2000 || r.year === 2004);

const existingPath = path.join('..', 'vote-analysis', 'results.json');
const existing = JSON.parse(fs.readFileSync(existingPath));

const combined = [...newRows, ...existing];
fs.writeFileSync(existingPath, JSON.stringify(combined) + '\n');
console.log(`${combined.length} total rows (added ${newRows.length} new)`);
