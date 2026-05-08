const fs = require('fs');

const csv = fs.readFileSync('1976-2020-president.csv', 'utf8');
const lines = csv.split('\n');
const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

const results = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // CSV parse: handle quoted fields
  const cols = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur);

  const row = {};
  headers.forEach((h, i) => row[h] = (cols[i] || '').trim());

  const year = parseInt(row['year']);
  if (year < 2000 || year > 2020) continue;

  const abbr = row['state_po'];
  const party = row['party_simplified'] || row['party_detailed'] || '';
  const votes = parseInt(row['candidatevotes']) || 0;
  const total = parseInt(row['totalvotes']) || 0;

  if (!results[year]) results[year] = {};
  if (!results[year][abbr]) results[year][abbr] = { D: 0, R: 0, total: 0 };

  if (party === 'DEMOCRAT') results[year][abbr].D += votes;
  else if (party === 'REPUBLICAN') results[year][abbr].R += votes;
  results[year][abbr].total = Math.max(results[year][abbr].total, total);
}

const output = [];
for (const year of Object.keys(results).sort()) {
  for (const abbr of Object.keys(results[year]).sort()) {
    const { D, R, total } = results[year][abbr];
    if (!total) continue;
    output.push({
      year: parseInt(year),
      abbr,
      d: Math.round(D / total * 1000) / 10,
      r: Math.round(R / total * 1000) / 10
    });
  }
}

fs.writeFileSync('state_2000_2020.json', JSON.stringify(output));
console.log(`${output.length} rows, years: ${[...new Set(output.map(r => r.year))].join(', ')}`);
